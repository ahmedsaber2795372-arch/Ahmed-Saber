
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import JournalEntries from './components/JournalEntries';
import Reports from './components/Reports';
import TransactionModule from './components/TransactionModule';
import Inventory from './components/Inventory';
import Settings from './components/Settings';
import { Account, JournalEntry, FinancialInsight, AccountType, InventoryItem, AppSettings } from './types';
import { INITIAL_ACCOUNTS, TRANSLATIONS } from './constants';
import { getFinancialAnalysis } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : {
      language: 'ar',
      theme: 'light',
      currency: 'SAR',
      companyName: 'مؤسسة الحلول الذكية'
    };
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('entries');
    return saved ? JSON.parse(saved) : [];
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('inventory');
    return saved ? JSON.parse(saved) : [];
  });

  const [insights, setInsights] = useState<FinancialInsight[]>([
    { title: "جاهز للعمل", content: "النظام يعمل الآن بكامل طاقته. يمكنك تسجيل العمليات من تبويب المبيعات أو المشتريات.", type: "success" }
  ]);

  const currencySymbol = settings.currency === 'SAR' ? (settings.language === 'ar' ? 'ر.س' : 'SAR') : (settings.language === 'ar' ? 'ج.م' : 'EGP');

  useEffect(() => {
    localStorage.setItem('accounts', JSON.stringify(accounts));
    localStorage.setItem('entries', JSON.stringify(entries));
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = settings.language;
  }, [accounts, entries, inventory, settings]);

  useEffect(() => {
    const fetchInsights = async () => {
      if (entries.length > 5 && navigator.onLine) {
        const data = await getFinancialAnalysis(accounts, entries);
        setInsights(data);
      }
    };
    fetchInsights();
  }, [entries.length]);

  const handleAddEntry = (entry: JournalEntry, inventoryUpdate?: { itemId: string, qty: number, price?: number }) => {
    setEntries(prev => [entry, ...prev]);
    setAccounts(prevAccounts => prevAccounts.map(account => {
      const entryItems = entry.items.filter(item => item.accountId === account.id);
      if (entryItems.length === 0) return account;
      let newBalance = account.balance;
      entryItems.forEach(item => {
        const isDebitNormal = [AccountType.ASSET, AccountType.EXPENSE].includes(account.type);
        newBalance += isDebitNormal ? (item.debit - item.credit) : (item.credit - item.debit);
      });
      return { ...account, balance: newBalance };
    }));

    if (inventoryUpdate) {
      setInventory(prevInv => prevInv.map(item => {
        if (item.id !== inventoryUpdate.itemId) return item;
        const newQty = item.quantity + inventoryUpdate.qty;
        let newPrice = item.unitPrice;
        if (inventoryUpdate.qty > 0 && inventoryUpdate.price) {
          newPrice = ((item.quantity * item.unitPrice) + (inventoryUpdate.qty * inventoryUpdate.price)) / newQty;
        }
        return { ...item, quantity: Math.max(0, newQty), unitPrice: newPrice };
      }));
    }
  };

  const handleExportData = () => {
    const data = { accounts, entries, inventory, settings, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart_accountant_backup_${new Date().toLocaleDateString()}.json`;
    link.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.accounts && data.entries) {
          setAccounts(data.accounts);
          setEntries(data.entries);
          setInventory(data.inventory || []);
          if(data.settings) setSettings(data.settings);
          alert('تمت استعادة البيانات بنجاح من الملف المختار! سيتم تحديث الشاشة الآن.');
          setActiveTab('dashboard');
        } else {
          alert('الملف المختار ليس ملف نسخة احتياطية صالح لهذا البرنامج.');
        }
      } catch (err) {
        alert('خطأ في قراءة الملف. تأكد أنه ملف .json تم تصديره من هذا البرنامج.');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (e.target) e.target.value = '';
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.name.includes(searchTerm) || acc.code.includes(searchTerm) || acc.type.includes(searchTerm)
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard accounts={accounts} insights={insights} currencySymbol={currencySymbol} language={settings.language} theme={settings.theme} />;
      case 'sales': return <TransactionModule type="sales" accounts={accounts} inventory={inventory} entries={entries} onAddEntry={handleAddEntry} currencySymbol={currencySymbol} language={settings.language} />;
      case 'purchases': return <TransactionModule type="purchases" accounts={accounts} inventory={inventory} entries={entries} onAddEntry={handleAddEntry} currencySymbol={currencySymbol} language={settings.language} />;
      case 'inventory': return <Inventory inventory={inventory} onUpdateInventory={(i) => setInventory([...inventory, i])} currencySymbol={currencySymbol} language={settings.language} />;
      case 'journal': return <JournalEntries entries={entries} accounts={accounts} onAddEntry={handleAddEntry} currencySymbol={currencySymbol} language={settings.language} />;
      case 'accounts':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-6">
              <div className="flex-1 min-w-[300px]">
                <h3 className="font-black text-xl text-slate-800 dark:text-white mb-2">دليل الحسابات (شجرة الحسابات)</h3>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="بحث برقم الحساب أو الاسم أو النوع..." 
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 text-slate-800 dark:text-white font-bold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <span className="absolute left-4 top-3 text-slate-400">🔍</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleExportData} 
                  className="bg-emerald-600 text-white px-6 py-3 rounded-2xl hover:bg-emerald-700 transition font-black text-xs shadow-lg shadow-emerald-900/10"
                >
                  تصدير نسخة احتياطية 📤
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-6 py-3 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition font-black text-xs border border-slate-200 dark:border-slate-700"
                >
                  فتح/استيراد ملف (.json) 📥
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImportData} className="hidden" accept=".json" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                      <th className="px-8 py-5">كود الحساب</th>
                      <th className="px-8 py-5">اسم الحساب</th>
                      <th className="px-8 py-5">النوع</th>
                      <th className="px-8 py-5 text-left">الرصيد الحالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredAccounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-8 py-4 font-mono text-xs text-slate-400 group-hover:text-emerald-600 transition-colors">#{acc.code}</td>
                        <td className="px-8 py-4 font-black text-sm text-slate-800 dark:text-slate-200">{acc.name}</td>
                        <td className="px-8 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                            acc.type === AccountType.ASSET ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' :
                            acc.type === AccountType.LIABILITY ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' :
                            acc.type === AccountType.INCOME ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' :
                            'bg-slate-50 text-slate-600 dark:bg-slate-800'
                          }`}>
                            {acc.type}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-left">
                          <span className={`font-black text-base ${acc.balance >= 0 ? 'text-slate-800 dark:text-white' : 'text-rose-500'}`}>
                            {acc.balance.toLocaleString()}
                          </span>
                          <span className="mr-1 text-[10px] text-slate-400">{currencySymbol}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'income-statement': return <Reports accounts={accounts} entries={entries} inventory={inventory} type="income" currencySymbol={currencySymbol} companyName={settings.companyName} language={settings.language} />;
      case 'balance-sheet': return <Reports accounts={accounts} entries={entries} inventory={inventory} type="balance" currencySymbol={currencySymbol} companyName={settings.companyName} language={settings.language} />;
      case 'inventory-report': return <Reports accounts={accounts} entries={entries} inventory={inventory} type="inventory" currencySymbol={currencySymbol} companyName={settings.companyName} language={settings.language} />;
      case 'settings': return <Settings settings={settings} onUpdate={setSettings} />;
      default: return <Dashboard accounts={accounts} insights={insights} currencySymbol={currencySymbol} language={settings.language} theme={settings.theme} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      stats={{ accounts: accounts.length, entries: entries.length }}
      settings={settings}
      onQuickExport={handleExportData}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
