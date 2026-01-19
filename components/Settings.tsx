
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { TRANSLATIONS } from '../constants';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const t = TRANSLATIONS[settings.language];
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* الأساسيات */}
      <div className="bg-white dark:bg-slate-900 p-6 lg:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-2xl lg:text-3xl font-black text-slate-800 dark:text-white mb-10 border-b dark:border-slate-800 pb-6 flex items-center gap-3">
          <span>⚙️</span> {t.settings}
        </h3>

        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">{t.companyNameLabel}</label>
            <input
              type="text"
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-800 dark:text-white font-bold"
              value={settings.companyName}
              onChange={(e) => onUpdate({ ...settings, companyName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">{t.languageLabel}</label>
              <select className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold" value={settings.language} onChange={(e) => onUpdate({ ...settings, language: e.target.value as 'ar' | 'en' })}>
                <option value="ar">العربية (AR)</option>
                <option value="en">English (EN)</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">{t.themeLabel}</label>
              <select className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold" value={settings.theme} onChange={(e) => onUpdate({ ...settings, theme: e.target.value as 'light' | 'dark' })}>
                <option value="light">{t.light}</option>
                <option value="dark">{t.dark}</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">{t.currencyLabel}</label>
              <select className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold" value={settings.currency} onChange={(e) => onUpdate({ ...settings, currency: e.target.value as 'SAR' | 'EGP' })}>
                <option value="SAR">SAR</option>
                <option value="EGP">EGP</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Hosting Guide */}
      <div className="bg-slate-950 p-8 lg:p-12 rounded-[2.5rem] text-white shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-10 text-9xl">🌐</div>
        <div className="relative z-10">
          <h3 className="text-xl lg:text-2xl font-black mb-6 flex items-center gap-3 text-emerald-400">
            <span>🚀</span> تشغيل البرنامج عبر GitHub
          </h3>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-2xl">
            يمكنك جعل هذا البرنامج متاحاً لك عبر الإنترنت (أونلاين) مجاناً للأبد باستخدام استضافة GitHub Pages. هذا يتيح لك فتحه من أي لابتوب في العالم وتثبيته كـ App.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <span className="text-emerald-500 font-black text-lg mb-2 block">1. إنشاء المستودع</span>
              <p className="text-xs text-slate-500">قم برفع كافة ملفات هذا المشروع إلى مستودع (Repository) جديد على حسابك في GitHub.</p>
            </div>
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <span className="text-emerald-500 font-black text-lg mb-2 block">2. تفعيل Pages</span>
              <p className="text-xs text-slate-500">اذهب إلى Settings داخل المستودع، ثم Pages، واختر Build from Branch (Main) وسيعطيك رابطاً حياً للبرنامج.</p>
            </div>
          </div>

          <div className="bg-emerald-900/20 border border-emerald-500/30 p-6 rounded-2xl">
             <h4 className="font-bold text-emerald-400 mb-2 text-sm">لماذا GitHub؟</h4>
             <ul className="text-[11px] text-slate-400 space-y-2 list-disc list-inside">
                <li>البرنامج سيعمل أوفلاين (بدون إنترنت) حتى لو تم حذفه من جهازك.</li>
                <li>تحديثات تلقائية وتخزين آمن للكود.</li>
                <li>إمكانية مشاركة التقارير مع الشركاء عبر الرابط (مع الحفاظ على خصوصية بياناتك المحفوظة محلياً).</li>
             </ul>
          </div>
        </div>
      </div>

      {/* Laptop Install */}
      <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-6 shadow-xl">
        <div className="text-4xl">💻</div>
        <div className="flex-1 text-center md:text-right">
           <h4 className="font-black text-lg">تثبيت النسخة الحالية</h4>
           <p className="text-xs opacity-80">إذا كنت تستخدم البرنامج الآن، يمكنك تثبيته كأيقونة على سطح المكتب للوصول السريع.</p>
        </div>
        <button 
          onClick={handleInstallClick} 
          disabled={!deferredPrompt}
          className="bg-white text-emerald-600 px-8 py-3 rounded-xl font-black text-sm hover:bg-slate-100 transition disabled:opacity-50"
        >
          تثبيت الآن
        </button>
      </div>
    </div>
  );
};

export default Settings;
