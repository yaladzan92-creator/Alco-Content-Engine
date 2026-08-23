'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Upload, Sparkles, Loader2 } from 'lucide-react';
import { getActiveProjectId } from '@/lib/storage';
import { CharacterDNA } from '@/lib/content-contract';
import { saveProjectCharacterDNA } from '@/lib/storage';
import { buildGeminiRequestHeaders } from '@/lib/client-gemini-key';

export default function CharacterDNASection({ 
  onDNAUpdate,
  projectId
}: { 
  onDNAUpdate: (dna: CharacterDNA) => void;
  projectId?: string;
}) {
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [dna, setDna] = useState<CharacterDNA | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files).slice(0, 3));
    }
  };

  const generateDNA = async () => {
    if (loading || images.length === 0) return;
    setLoading(true);
    try {
      const base64Images = await Promise.all(
        images.map(img => new Promise<{ data: string; mimeType: string }>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve({ 
            data: (e.target?.result as string).split(',')[1], 
            mimeType: img.type 
          });
          reader.readAsDataURL(img);
        }))
      );

      const response = await fetch('/api/gemini/generate-dna', {
        method: 'POST',
        headers: buildGeminiRequestHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ images: base64Images, prompt: "Maintain character consistency." }),
      });

      const data = await response.json();
      const newDNA: CharacterDNA = { ...data.dna, preview_image: data.previewImageBase64 };
      setDna(newDNA);
      onDNAUpdate(newDNA);
      
      const targetProjectId = projectId || getActiveProjectId() || 'default';
      saveProjectCharacterDNA(targetProjectId, newDNA);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#fffdf8] rounded-xl border border-[#e7e0d4] shadow-xs">
      <h2 className="text-base font-bold text-[#1f2933] mb-4">Character DNA</h2>
      
      <div className="flex gap-3 items-center mb-6">
        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="dna-upload" />
        <label htmlFor="dna-upload" className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white text-[#1f2933] font-semibold border border-[#e7e0d4] rounded-xl hover:bg-[#f6f3ee] text-xs transition shadow-xs">
          <Upload size={14} className="text-[#0f766e]" /> Upload Ref (1-3)
        </label>
        <button 
          onClick={generateDNA} 
          disabled={images.length === 0 || loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f766e] text-white font-bold rounded-xl hover:bg-[#115e59] disabled:opacity-50 text-xs transition shadow-xs"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
          Generate DNA
        </button>
      </div>

      {dna && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Image 
            src={`data:image/png;base64,${dna.preview_image}`} 
            alt="Character Preview" 
            width={400} 
            height={400} 
            className="rounded-xl w-full aspect-square object-cover border border-[#e7e0d4]" 
          />
          <div className="text-[#1f2933] bg-[#f6f3ee] p-3 rounded-xl border border-[#e7e0d4] text-xs font-mono overflow-y-auto max-h-60 custom-scrollbar">
            <pre>{JSON.stringify(dna.identity, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
