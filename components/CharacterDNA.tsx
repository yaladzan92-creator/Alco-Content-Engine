'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Upload, Sparkles, Loader2 } from 'lucide-react';
import { getActiveProjectId } from '@/lib/storage';
import { CharacterDNA } from '@/lib/content-contract';
import { saveProjectCharacterDNA } from '@/lib/storage';

export default function CharacterDNASection({ onDNAUpdate }: { onDNAUpdate: (dna: CharacterDNA) => void }) {
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [dna, setDna] = useState<CharacterDNA | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files).slice(0, 3));
    }
  };

  const generateDNA = async () => {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: base64Images, prompt: "Maintain character consistency." }),
      });

      const data = await response.json();
      const newDNA: CharacterDNA = { ...data.dna, preview_image: data.previewImageBase64 };
      setDna(newDNA);
      onDNAUpdate(newDNA);
      
      const projectId = getActiveProjectId() || 'default';
      saveProjectCharacterDNA(projectId, newDNA);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-zinc-900 rounded-lg border border-zinc-800">
      <h2 className="text-xl font-semibold text-white mb-4">Character DNA</h2>
      
      <div className="flex gap-4 items-center mb-6">
        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="dna-upload" />
        <label htmlFor="dna-upload" className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700">
          <Upload size={16} /> Upload Ref (1-3)
        </label>
        <button 
          onClick={generateDNA} 
          disabled={images.length === 0 || loading}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-black rounded hover:bg-brand-muted disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          Generate DNA
        </button>
      </div>

      {dna && (
        <div className="grid grid-cols-2 gap-4">
          <Image 
            src={`data:image/png;base64,${dna.preview_image}`} 
            alt="Character Preview" 
            width={400} 
            height={400} 
            className="rounded-lg w-full aspect-square object-cover" 
          />
          <div className="text-zinc-300 text-sm overflow-y-auto max-h-60 custom-scrollbar">
            <pre>{JSON.stringify(dna.identity, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
