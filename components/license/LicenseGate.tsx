'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Key,
  Copy,
  Check,
  RefreshCw,
  Laptop,
  Mail,
  User,
  FileText,
  AlertTriangle,
  Loader2,
  Lock,
  ArrowRight,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { useLicense } from '@/lib/license/license-context';
import { AlcoVerificationResult } from '@/lib/license/types';
import { ALCO_APP_ID } from '@/lib/license/authority-key';

interface LicenseGateProps {
  children: React.ReactNode;
}

export const LicenseGate: React.FC<LicenseGateProps> = ({ children }) => {
  const { state, deviceId, isLoading, activateLicense, generateRequestCode, reverifyLicense } = useLicense();

  const [activeTab, setActiveTab] = useState<'activate' | 'request' | 'guide'>('activate');

  // Request Code Generator state
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [generatedRequestCode, setGeneratedRequestCode] = useState<string | null>(null);
  const [reqCopied, setReqCopied] = useState(false);
  const [devCopied, setDevCopied] = useState(false);
  const [reqError, setReqError] = useState<string | null>(null);

  // Activation state
  const [licenseInput, setLicenseInput] = useState('');
  const [activationResult, setActivationResult] = useState<AlcoVerificationResult | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  // Re-verify state
  const [isReverifying, setIsReverifying] = useState(false);

  const handleCopyDeviceId = () => {
    if (!deviceId) return;
    navigator.clipboard.writeText(deviceId);
    setDevCopied(true);
    setTimeout(() => setDevCopied(false), 2000);
  };

  const handleGenerateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setReqError(null);
    if (!custName.trim()) {
      setReqError('Nama lengkap pelanggan wajib diisi.');
      return;
    }
    if (!custEmail.trim() || !custEmail.includes('@')) {
      setReqError('Email valid wajib diisi.');
      return;
    }

    try {
      const code = generateRequestCode({
        name: custName.trim(),
        email: custEmail.trim(),
        notes: notes.trim() || undefined,
      });
      setGeneratedRequestCode(code);
    } catch (err: unknown) {
      setReqError(err instanceof Error ? err.message : 'Gagal membuat Request Code');
    }
  };

  const handleCopyRequestCode = () => {
    if (!generatedRequestCode) return;
    navigator.clipboard.writeText(generatedRequestCode);
    setReqCopied(true);
    setTimeout(() => setReqCopied(false), 2000);
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseInput.trim()) return;

    setIsActivating(true);
    setActivationResult(null);

    const result = await activateLicense(licenseInput.trim());
    setActivationResult(result);
    setIsActivating(false);

    if (result.valid) {
      setLicenseInput('');
    }
  };

  const handleReverify = async () => {
    setIsReverifying(true);
    await reverifyLicense();
    setIsReverifying(false);
  };

  // 1. Loading State (Checking license integrity at startup)
  if (isLoading) {
    return (
      <div id="alco-license-checking" className="min-h-screen bg-background flex flex-col items-center justify-center p-6 select-none font-sans">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl flex flex-col items-center text-center space-y-6">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Lock className="w-8 h-8 animate-pulse text-primary" />
            </div>
            <div className="absolute -inset-2 border-2 border-primary/30 border-t-primary rounded-3xl animate-spin pointer-events-none" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 text-xs font-semibold tracking-wider uppercase">
              <Zap size={13} className="text-cyan-600 dark:text-cyan-400" />
              <span>ALCO Content Engine v2.2</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Memeriksa Integritas Lisensi</h1>
            <p className="text-sm text-muted-foreground">
              Memvalidasi tanda tangan digital Ed25519 dan identitas perangkat keras lokal...
            </p>
          </div>

          {deviceId ? (
            <div className="w-full bg-muted/50 border border-border/80 rounded-xl p-3 text-left">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Hardware Device ID
              </div>
              <div
                suppressHydrationWarning
                className="font-mono text-xs text-foreground font-semibold tracking-widest break-all"
              >
                {deviceId}
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>ALCO License Protocol v2.2 Fail-Closed Gate</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Active License State -> Render Workspace
  if (state.status === 'active' && state.license) {
    return <>{children}</>;
  }

  // 3. Unlicensed / Invalid / Expired State -> BLOCK WORKSPACE and Render Full-Screen License Gate
  return (
    <div id="alco-license-gate" className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Bar */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm font-black">
            <Zap size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-foreground">ALCO Content Engine</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                Cyan Accent
              </span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              License Protocol v2.2 &bull; App ID: {ALCO_APP_ID}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
            <ShieldAlert size={14} />
            <span>Akses Dibatasi &bull; Belum Berlisensi</span>
          </div>
        </div>
      </header>

      {/* Main Activation Screen */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Hero Banner inside Card */}
          <div className="p-6 sm:p-8 border-b border-border bg-muted/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-primary/10 text-primary uppercase tracking-wider mb-1">
                  <Lock size={12} />
                  Startup License Gate
                </div>
                <h1 className="text-2xl font-black tracking-tight text-foreground">Aktivasi Lisensi Diperlukan</h1>
                <p className="text-sm text-muted-foreground max-w-lg">
                  Sesuai <strong>ALCO APP STANDARD v2.2</strong>, workspace aplikasi hanya dapat dibuka setelah lisensi perangkat keras diverifikasi secara lokal menggunakan Authority Public Key Ed25519.
                </p>
              </div>

              <button
                id="btn-reverify-license"
                onClick={handleReverify}
                disabled={isReverifying}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-border bg-background hover:bg-muted text-foreground transition-colors shrink-0 disabled:opacity-50"
                title="Periksa ulang lisensi tersimpan"
              >
                <RefreshCw size={14} className={isReverifying ? 'animate-spin' : ''} />
                <span>Cek Ulang</span>
              </button>
            </div>

            {/* Error Message if present */}
            {state.error && (
              <div className="mt-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Pemeriksaan Lisensi Gagal:</div>
                  <div className="text-destructive/90 mt-0.5">{state.error}</div>
                </div>
              </div>
            )}

            {/* Device ID Display Box */}
            <div className="mt-5 p-4 rounded-xl bg-background border border-border">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Laptop size={14} className="text-primary" />
                  <span>Hardware Device ID (Windows MachineGuid)</span>
                </div>
                <button
                  id="btn-copy-device-id"
                  onClick={handleCopyDeviceId}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  {devCopied ? (
                    <>
                      <Check size={13} className="text-green-600 dark:text-green-400" />
                      <span className="text-green-600 dark:text-green-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Salin Device ID</span>
                    </>
                  )}
                </button>
              </div>
              <div
                suppressHydrationWarning
                className="font-mono text-sm font-bold tracking-widest text-foreground bg-muted/40 px-3 py-2 rounded-lg border border-border/60 select-all break-all"
              >
                {deviceId || 'ALCO-DEV-UNKNOWN'}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Device ID ini stabil dan terikat dengan perangkat ini. Digunakan oleh ALCO License Generator resmi untuk menandatangani lisensi Anda.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border bg-muted/40 px-6">
            <button
              id="tab-activate-license"
              onClick={() => setActiveTab('activate')}
              className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'activate'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Key size={15} />
              <span>Masukkan Kode Lisensi</span>
            </button>
            <button
              id="tab-request-code"
              onClick={() => setActiveTab('request')}
              className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'request'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText size={15} />
              <span>Buat Request Code v2</span>
            </button>
            <button
              id="tab-license-guide"
              onClick={() => setActiveTab('guide')}
              className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'guide'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <HelpCircle size={15} />
              <span>Panduan</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            {/* TAB 1: ACTIVATE LICENSE */}
            {activeTab === 'activate' && (
              <form onSubmit={handleActivate} className="space-y-4">
                <div>
                  <label htmlFor="input-license-code" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    ALCO Signed License Code
                  </label>
                  <textarea
                    id="input-license-code"
                    rows={4}
                    value={licenseInput}
                    onChange={(e) => setLicenseInput(e.target.value)}
                    placeholder="ALCO-LIC-v1.eyJsaWNlbnNlVmVyc2lvbiI6IjEuMCIs... (Tempel kode lisensi dari Owner di sini)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Format resmi: <code className="font-mono text-foreground font-semibold">ALCO-LIC-v1.&lt;PAYLOAD&gt;.&lt;SIGNATURE&gt;</code>
                  </p>
                </div>

                {activationResult && !activationResult.valid && (
                  <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Aktivasi Ditolak:</div>
                      <div className="text-destructive/90 mt-0.5">{activationResult.error}</div>
                    </div>
                  </div>
                )}

                <button
                  id="btn-submit-license-activation"
                  type="submit"
                  disabled={isActivating || !licenseInput.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isActivating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Memverifikasi Signature Ed25519...</span>
                    </>
                  ) : (
                    <>
                      <Key size={16} />
                      <span>Verifikasi & Aktifkan Workspace</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: GENERATE REQUEST CODE v2 */}
            {activeTab === 'request' && (
              <div className="space-y-4">
                <form onSubmit={handleGenerateRequest} className="space-y-3.5">
                  <div>
                    <label htmlFor="input-customer-name" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Nama Lengkap Pelanggan
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-3 text-muted-foreground" />
                      <input
                        id="input-customer-name"
                        type="text"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="input-customer-email" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-3 text-muted-foreground" />
                      <input
                        id="input-customer-email"
                        type="email"
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        placeholder="nama@perusahaan.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="input-request-notes" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Catatan Tambahan (Opsional)
                    </label>
                    <input
                      id="input-request-notes"
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Paket Pro Tahunan / Lisensi Lifetime"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  {reqError && (
                    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                      {reqError}
                    </div>
                  )}

                  <button
                    id="btn-generate-request-code"
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-bold border border-border transition-all flex items-center justify-center gap-2"
                  >
                    <FileText size={15} />
                    <span>Hasilkan Request Code v2</span>
                  </button>
                </form>

                {generatedRequestCode && (
                  <div className="mt-4 p-4 rounded-xl bg-muted/40 border border-border space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Check size={14} className="text-green-600 dark:text-green-400" />
                        <span>Request Code v2 Berhasil Dibuat</span>
                      </div>
                      <button
                        id="btn-copy-request-code"
                        onClick={handleCopyRequestCode}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        {reqCopied ? (
                          <>
                            <Check size={13} className="text-green-600 dark:text-green-400" />
                            <span className="text-green-600 dark:text-green-400">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Salin Request Code</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="font-mono text-xs text-foreground bg-background p-3 rounded-lg border border-border break-all select-all max-h-28 overflow-y-auto">
                      {generatedRequestCode}
                    </div>

                    <p className="text-[11px] text-muted-foreground">
                      Kirimkan kode ini ke Owner atau admin ALCO Ecosystem. Request Code dilengkapi checksum CRC16 untuk mencegah kerusakan teks.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: GUIDELINES */}
            {activeTab === 'guide' && (
              <div className="space-y-4 text-xs text-muted-foreground">
                <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                  <div className="text-sm font-bold text-foreground">Alur Aktivasi 4 Langkah:</div>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">1</div>
                      <div>
                        <strong className="text-foreground">Buat Request Code:</strong> Buka tab &quot;Buat Request Code v2&quot;, isi nama dan email Anda, lalu salin kode yang dihasilkan.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">2</div>
                      <div>
                        <strong className="text-foreground">Kirim ke Owner ALCO:</strong> Kirimkan Request Code tersebut kepada Owner / License Generator resmi Aladzan Corpora.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">3</div>
                      <div>
                        <strong className="text-foreground">Terima License Code:</strong> Owner akan memproses kode dan menandatangani License Code resmi dengan kunci privat otoritas Ed25519.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">4</div>
                      <div>
                        <strong className="text-foreground">Aktifkan Aplikasi:</strong> Tempelkan License Code pada tab &quot;Masukkan Kode Lisensi&quot; dan tekan tombol &quot;Verifikasi &amp; Aktifkan Workspace&quot;.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border/80 bg-background flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-primary shrink-0" />
                    <span>Keamanan Terjamin: Lisensi diverifikasi secara lokal dan offline menggunakan Authority Public Key.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Security Notice */}
          <div className="px-6 py-3.5 bg-muted/40 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-green-600 dark:text-green-400" />
              <span>Ed25519 Local Verification &bull; Fail-Closed Security</span>
            </div>
            <span>Aladzan Corpora Ecosystem</span>
          </div>
        </div>
      </main>
    </div>
  );
};
