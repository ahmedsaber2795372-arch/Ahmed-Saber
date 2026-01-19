
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { TRANSLATIONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats?: { accounts: number, entries: number };
  settings: AppSettings;
  onQuickExport?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, stats, settings, onQuickExport }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const t = TRANSLATIONS[settings.language];
  const isRtl = settings.language === 'ar';

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    
    // PWA Install Prompt Logic
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });

    if (window.innerWidth < 1024) setIsSidebarOpen(false);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstallPrompt(null);
  };

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: '📊' },
    { id: 'sales', label: t.sales, icon: '💰' },
    { id: 'purchases', label: t.purchases, icon: '🛒' },
    { id: 'inventory', label: t.inventory, icon: '📦' },
    { id: 'journal', label: t.journal, icon: '📝' },
    { id: 'accounts', label: t.accounts, icon: '📁' },
    { id: 'income-statement', label: t.incomeStatement, icon: '📈' },
    { id: 'balance-sheet', label: t.balanceSheet, icon: '⚖️' },
    { id: 'settings', label: t.settings, icon: '⚙️' },
  ];

  return (
    <div className={`flex min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300 overflow-x-hidden ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
      
      {/* Desktop Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 h-full bg-slate-900 dark:bg-black text-white hidden lg:flex flex-col shadow-2xl z-40 transition-all duration-300 print:hidden ${
          isRtl ? 'right-0' : 'left-0'
        } ${isSidebarOpen ? 'w-64' : 'w-20'}`}
      >
        <div className="p-6 text-center border-b border-slate-800">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl mx-auto mb-3 flex items-center justify-center font-bold text-2xl shadow-lg transform hover:scale-105 transition">S</div>
          {isSidebarOpen && <div className="text-[10px] font-black tracking-widest text-emerald-400 uppercase truncate px-2">{settings.companyName}</div>}
        </div>
        
        <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                ? 'bg-emerald-600 text-white shadow-lg' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`text-xl ${isSidebarOpen ? (isRtl ? 'ml-3' : 'mr-3') : ''}`}>{item.icon}</span>
              {isSidebarOpen && <span className="font-bold text-xs truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 flex justify-center">
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
             className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
           >
             {isRtl ? (isSidebarOpen ? '❯' : '❮') : (isSidebarOpen ? '❮' : '❯')}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={`flex-1 transition-all duration-300 flex flex-col min-h-screen pb-20 lg:pb-0 ${
          isSidebarOpen ? (isRtl ? 'lg:mr-64' : 'lg:ml-64') : (isRtl ? 'lg:mr-20' : 'lg:ml-20')
        } print:m-0`}
      >
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 lg:px-8 py-3 lg:py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center print:hidden transition-colors">
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">S</div>
            <h1 className="text-sm lg:text-lg font-black text-slate-800 dark:text-white uppercase">{menuItems.find(i => i.id === activeTab)?.label}</h1>
            
            {/* Install Button for Laptop */}
            {installPrompt && (
              <button 
                onClick={handleInstall}
                className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-emerald-100 transition border border-emerald-100"
              >
                <span>💻</span> {isRtl ? 'تثبيت البرنامج على اللابتوب' : 'Install on PC'}
              </button>
            )}

            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-bold ${isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <span className="hidden sm:inline">{isOnline ? 'متصل' : 'أوفلاين'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <button 
              onClick={onQuickExport}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-lg"
              title="نسخة احتياطية"
            >
              💾
            </button>
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-sm flex items-center justify-center text-sm lg:text-xl">👤</div>
          </div>
        </header>
        
        <div className="flex-1 p-4 lg:p-8 bg-white dark:bg-slate-950 max-w-[1600px] mx-auto w-full">
          {children}
        </div>

        {/* Mobile Navigation (Visible only on small screens) */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around px-2 lg:hidden z-50 shadow-2xl">
          {[menuItems[0], menuItems[1], menuItems[2], menuItems[4]].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full transition-all ${
                activeTab === item.id ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-[9px] font-black truncate">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center w-full h-full transition-all ${
              activeTab === 'settings' ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            <span className="text-xl mb-1">⚙️</span>
            <span className="text-[9px] font-black truncate">الإعدادات</span>
          </button>
        </nav>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        @media (display-mode: standalone) {
          header { padding-top: 10px; } /* Adjust for OS window bars if needed */
        }
      `}</style>
    </div>
  );
};

export default Layout;
