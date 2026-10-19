import React, { useState } from 'react';
import { X, Check, Activity, Trash2, Volume2, Globe, Sliders, Server, Info, ExternalLink } from 'lucide-react';
import { UserSettings, Language, ServerKey } from '../types.ts';
import { useTranslation } from '../i18n/translations.ts';
import { testVidSrcLatency } from '../services/vidsrc.ts';

interface SettingsModalProps {
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  onClearHistory: () => void;
  onClose: () => void;
  currentLang: Language;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClearHistory,
  onClose,
  currentLang,
}) => {
  const [form, setForm] = useState<UserSettings>({ ...settings });
  const [diagRunning, setDiagRunning] = useState(false);
  const [diagResult, setDiagResult] = useState<{ status: string; latencyMs: number; details: string } | null>(null);
  const [historyClearedMsg, setHistoryClearedMsg] = useState(false);
  const t = useTranslation(currentLang);

  const runDiagnostics = async () => {
    setDiagRunning(true);
    const res = await testVidSrcLatency();
    setDiagResult(res);
    setDiagRunning(false);
  };

  const handleSave = () => {
    onSaveSettings(form);
    onClose();
  };

  const handleClear = () => {
    onClearHistory();
    setHistoryClearedMsg(true);
    setTimeout(() => setHistoryClearedMsg(false), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-[#181818] border border-zinc-800 rounded-xl shadow-2xl p-6 text-white max-h-[92vh] overflow-y-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#e50914]" />
            <h2 className="text-lg font-bold text-white">{t.settingsTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form fields */}
        <div className="space-y-4 text-sm">
          {/* Default Server Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-[#e50914]" />
              <span>{t.defaultServerLabel}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, defaultServer: 'vidsrc_sh' })}
                className={`p-2.5 rounded-lg border text-xs font-semibold text-left rtl:text-right transition cursor-pointer ${
                  form.defaultServer === 'vidsrc_sh'
                    ? 'bg-[#e50914]/20 border-[#e50914] text-white'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <p className="font-bold">Server 1 (SH)</p>
                <p className="text-[10px] text-zinc-400">VidSrc Official Pro</p>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, defaultServer: 'vidsrc_to' })}
                className={`p-2.5 rounded-lg border text-xs font-semibold text-left rtl:text-right transition cursor-pointer ${
                  form.defaultServer === 'vidsrc_to'
                    ? 'bg-[#e50914]/20 border-[#e50914] text-white'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <p className="font-bold">Server 2 (TO)</p>
                <p className="text-[10px] text-zinc-400">Fast Edge Mirror</p>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, defaultServer: 'vidsrc_me' })}
                className={`p-2.5 rounded-lg border text-xs font-semibold text-left rtl:text-right transition cursor-pointer ${
                  form.defaultServer === 'vidsrc_me'
                    ? 'bg-[#e50914]/20 border-[#e50914] text-white'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <p className="font-bold">Server 3 (ME)</p>
                <p className="text-[10px] text-zinc-400">Query Format Host</p>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, defaultServer: 'multiembed' })}
                className={`p-2.5 rounded-lg border text-xs font-semibold text-left rtl:text-right transition cursor-pointer ${
                  form.defaultServer === 'multiembed'
                    ? 'bg-[#e50914]/20 border-[#e50914] text-white'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <p className="font-bold">Server 4 (Multi)</p>
                <p className="text-[10px] text-zinc-400">Universal Backup</p>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, defaultServer: 'custom' })}
                className={`p-2.5 rounded-lg border text-xs font-semibold text-left rtl:text-right transition cursor-pointer ${
                  form.defaultServer === 'custom'
                    ? 'bg-[#e50914]/20 border-[#e50914] text-white'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <p className="font-bold">Custom IP/Domain</p>
                <p className="text-[10px] text-zinc-400">vidsrc-ip.com / CNAME</p>
              </button>
            </div>
          </div>

          {/* Custom Domain / IP Address */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 space-y-2">
            <label className="block text-xs font-semibold text-zinc-300">
              {t.customDomainLabel}
            </label>
            <input
              type="text"
              value={form.customDomain}
              onChange={(e) => setForm({ ...form, customDomain: e.target.value })}
              placeholder="https://vidsrc-ip.com or https://player.yourdomain.com"
              className="w-full bg-black/60 border border-zinc-700 text-white text-xs rounded-lg p-2.5 focus:outline-none focus:border-[#e50914]"
            />
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {t.customDomainHelp}
            </p>
            {/* Cloudflare setup hint from documentation */}
            <div className="text-[10px] font-mono bg-black/70 p-2 rounded border border-zinc-800 text-zinc-400">
              <span className="text-amber-400 font-bold block mb-1">Cloudflare CNAME Setup:</span>
              Type: CNAME • Name: @ • Value: <span className="text-white font-bold">vidsrc-ip.com</span> • SSL: Flexible
            </div>
          </div>

          {/* Autoplay & Autonext toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2.5 p-3 bg-zinc-900/60 rounded-lg border border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={form.autoplay}
                onChange={(e) => setForm({ ...form, autoplay: e.target.checked })}
                className="accent-[#e50914] w-4 h-4 rounded cursor-pointer"
              />
              <span className="font-medium text-white">{t.autoplay}</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 bg-zinc-900/60 rounded-lg border border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={form.autonext}
                onChange={(e) => setForm({ ...form, autonext: e.target.checked })}
                className="accent-[#e50914] w-4 h-4 rounded cursor-pointer"
              />
              <span className="font-medium text-white">{t.autonext}</span>
            </label>
          </div>

          {/* Compact Layout & Sound FX */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2.5 p-3 bg-zinc-900/60 rounded-lg border border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={form.compactPosters}
                onChange={(e) => setForm({ ...form, compactPosters: e.target.checked })}
                className="accent-[#e50914] w-4 h-4 rounded cursor-pointer"
              />
              <span className="font-medium text-white">{t.compactLayout}</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 bg-zinc-900/60 rounded-lg border border-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={form.soundEffects}
                onChange={(e) => setForm({ ...form, soundEffects: e.target.checked })}
                className="accent-[#e50914] w-4 h-4 rounded cursor-pointer"
              />
              <span className="font-medium text-white">{t.soundEffects}</span>
            </label>
          </div>

          {/* Subtitle priority */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              {t.subtitlePriority}
            </label>
            <select
              value={form.subtitleLanguage}
              onChange={(e) => setForm({ ...form, subtitleLanguage: e.target.value as any })}
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-[#e50914] cursor-pointer"
            >
              <option value="ar,en">{t.arabicThenEnglish}</option>
              <option value="en">{t.englishOnly}</option>
              <option value="fr,en">{t.frenchThenEnglish}</option>
              <option value="en,ar,fr">{t.englishArabicFrench}</option>
            </select>
          </div>

          {/* Custom Subtitle URL */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              {t.customSubUrl}
            </label>
            <input
              type="url"
              value={form.customSubtitleUrl}
              onChange={(e) => setForm({ ...form, customSubtitleUrl: e.target.value })}
              placeholder="https://example.com/subs/arabic.vtt"
              className="w-full bg-zinc-900 border border-zinc-700 text-white text-xs rounded-lg p-2.5 focus:outline-none focus:border-[#e50914]"
            />
          </div>

          {/* Diagnostics Section */}
          <div className="border-t border-zinc-800 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                {t.diagnosticsTitle}
              </span>
              <button
                type="button"
                onClick={runDiagnostics}
                disabled={diagRunning}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-2.5 py-1 rounded transition cursor-pointer"
              >
                {diagRunning ? 'Testing...' : t.checkApi}
              </button>
            </div>

            {diagResult && (
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs font-mono">
                <div className="flex items-center justify-between text-zinc-300">
                  <span>Endpoint: https://vidsrc.sh</span>
                  <span className={diagResult.status === 'ok' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                    {diagResult.status === 'ok' ? `${diagResult.latencyMs}ms` : 'FAIL'}
                  </span>
                </div>
                <p className="text-zinc-500 mt-1">{diagResult.details}</p>
              </div>
            )}
          </div>
        </div>

        {/* Clear History & Save Actions */}
        <div className="border-t border-zinc-800 pt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-3 py-2 rounded border border-red-500/30 hover:bg-red-500/10 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearHistory}</span>
          </button>

          {historyClearedMsg && (
            <span className="text-xs text-emerald-400 font-semibold animate-pulse">
              {t.historyCleared}
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-zinc-400 hover:text-white px-3 py-2 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 bg-[#e50914] hover:bg-red-600 text-white font-bold text-xs px-4 py-2 rounded shadow transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t.saveSettings}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
