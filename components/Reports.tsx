
import React, { useState } from 'react';
import { Account, AccountType, JournalEntry, InventoryItem } from '../types';

interface ReportsProps {
  accounts: Account[];
  entries: JournalEntry[];
  inventory: InventoryItem[];
  type: 'income' | 'balance' | 'inventory';
  currencySymbol: string;
  companyName: string;
  language: 'ar' | 'en';
}

const Reports: React.FC<ReportsProps> = ({ accounts, entries, inventory, type, currencySymbol, companyName, language }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [prevStartDate, setPrevStartDate] = useState('');
  const [prevEndDate, setPrevEndDate] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState('الكل');

  const handlePrint = () => {
    window.print();
  };

  const getBalanceInRange = (accountId: string, normalType: 'debit' | 'credit', s: string, e: string) => {
    return entries
      .filter(entry => {
        if (!s && !e) return true;
        const entryDate = entry.date;
        const start = s || '1970-01-01';
        const end = e || '2099-12-31';
        return entryDate >= start && entryDate <= end;
      })
      .reduce((total, entry) => {
        const item = entry.items.find(i => i.accountId === accountId);
        if (!item) return total;
        return normalType === 'debit' 
          ? total + (item.debit - item.credit) 
          : total + (item.credit - item.debit);
      }, 0);
  };

  const calculateChange = (current: number, previous: number) => {
    const diff = current - previous;
    const percent = previous !== 0 ? (diff / Math.abs(previous)) * 100 : 0;
    return { diff, percent };
  };

  const renderIncomeStatement = () => {
    const incomeAccounts = accounts.filter(a => a.type === AccountType.INCOME);
    const expenseAccounts = accounts.filter(a => a.type === AccountType.EXPENSE);
    
    const mappedAccounts = [...incomeAccounts, ...expenseAccounts].map(acc => {
      const current = getBalanceInRange(acc.id, (acc.type === AccountType.EXPENSE ? 'debit' : 'credit'), startDate, endDate);
      const previous = isCompareMode ? getBalanceInRange(acc.id, (acc.type === AccountType.EXPENSE ? 'debit' : 'credit'), prevStartDate, prevEndDate) : 0;
      const { diff, percent } = calculateChange(current, previous);
      return { ...acc, current, previous, diff, percent };
    });

    const totalIncomeCurrent = mappedAccounts.filter(a => a.type === AccountType.INCOME).reduce((s, a) => s + a.current, 0);
    const totalIncomePrev = mappedAccounts.filter(a => a.type === AccountType.INCOME).reduce((s, a) => s + a.previous, 0);
    const incomeStats = calculateChange(totalIncomeCurrent, totalIncomePrev);

    const cogsAccounts = mappedAccounts.filter(a => a.code === '5202' || a.name.includes('تكلفة البضاعة'));
    const totalCogsCurrent = cogsAccounts.reduce((s, a) => s + a.current, 0);
    const totalCogsPrev = cogsAccounts.reduce((s, a) => s + a.previous, 0);
    
    const grossProfitCurrent = totalIncomeCurrent - totalCogsCurrent;
    const grossProfitPrev = totalIncomePrev - totalCogsPrev;
    const grossProfitStats = calculateChange(grossProfitCurrent, grossProfitPrev);

    const otherExpenses = mappedAccounts.filter(a => a.type === AccountType.EXPENSE && !cogsAccounts.find(c => c.id === a.id));
    const totalExpCurrent = otherExpenses.reduce((s, a) => s + a.current, 0);
    const totalExpPrev = otherExpenses.reduce((s, a) => s + a.previous, 0);
    const expStats = calculateChange(totalExpCurrent, totalExpPrev);

    const netProfitCurrent = grossProfitCurrent - totalExpCurrent;
    const netProfitPrev = grossProfitPrev - totalExpPrev;
    const netProfitStats = calculateChange(netProfitCurrent, netProfitPrev);

    return (
      <div className="space-y-6">
        {/* Filters Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 print:hidden">
          <div className="flex flex-wrap gap-6 items-end">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">الفترة الحالية</label>
              <div className="flex gap-2">
                <input type="date" className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm dark:text-white outline-none focus:ring-2 focus:ring-emerald-500" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <input type="date" className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm dark:text-white outline-none focus:ring-2 focus:ring-emerald-500" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center gap-3 h-[42px]">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isCompareMode} onChange={() => setIsCompareMode(!isCompareMode)} />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="mr-3 text-sm font-bold text-slate-600 dark:text-slate-400">تفعيل المقارنة</span>
              </label>
            </div>

            {isCompareMode && (
              <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">فترة المقارنة</label>
                <div className="flex gap-2">
                  <input type="date" className="px-3 py-2 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-lg text-sm dark:text-white outline-none" value={prevStartDate} onChange={e => setPrevStartDate(e.target.value)} />
                  <input type="date" className="px-3 py-2 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-lg text-sm dark:text-white outline-none" value={prevEndDate} onChange={e => setPrevEndDate(e.target.value)} />
                </div>
              </div>
            )}
            
            <div className="flex-1 flex justify-end gap-3">
              <button onClick={() => { setStartDate(''); setEndDate(''); setPrevStartDate(''); setPrevEndDate(''); setIsCompareMode(false); }} className="px-4 py-2 text-slate-400 hover:text-slate-600 text-sm">إعادة ضبط</button>
              <button onClick={handlePrint} className="bg-slate-900 dark:bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2"><span>📄</span> طباعة التقرير</button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 max-w-6xl mx-auto print:shadow-none print:border-none print:bg-white print:p-0 print:text-black">
          <div className="text-center mb-12 border-b dark:border-slate-800 pb-8">
            <h4 className="text-emerald-600 font-bold mb-2">{companyName}</h4>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white">قائمة الدخل المقارنة</h2>
            <div className="flex justify-center gap-4 mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
               <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">الفترة الحالية: {startDate || '...'} / {endDate || '...'}</span>
               {isCompareMode && <span className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">فترة المقارنة: {prevStartDate || '...'} / {prevEndDate || '...'}</span>}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase border-b-2 border-slate-900 dark:border-slate-700">
                  <th className="py-4 px-2">الحساب</th>
                  <th className="py-4 px-2 text-left">الفترة الحالية</th>
                  {isCompareMode && (
                    <>
                      <th className="py-4 px-2 text-left">الفترة السابقة</th>
                      <th className="py-4 px-2 text-left">التغير (المبلغ)</th>
                      <th className="py-4 px-2 text-left">التغير (%)</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {/* Income Section */}
                <tr><td colSpan={isCompareMode ? 5 : 2} className="py-6 font-black text-lg text-emerald-600 dark:text-emerald-400">الإيرادات</td></tr>
                {mappedAccounts.filter(a => a.type === AccountType.INCOME).map(a => (
                  <tr key={a.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 px-2 font-medium">{a.name}</td>
                    <td className="py-3 px-2 text-left font-bold">{a.current.toLocaleString()}</td>
                    {isCompareMode && (
                      <>
                        <td className="py-3 px-2 text-left text-slate-400">{a.previous.toLocaleString()}</td>
                        <td className={`py-3 px-2 text-left font-bold ${a.diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{a.diff > 0 ? '+' : ''}{a.diff.toLocaleString()}</td>
                        <td className={`py-3 px-2 text-left font-black ${a.percent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {a.percent >= 0 ? '↑' : '↓'} {Math.abs(a.percent).toFixed(1)}%
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                <tr className="bg-slate-50 dark:bg-slate-800/50 font-black text-slate-900 dark:text-white">
                  <td className="py-4 px-4 rounded-r-xl">إجمالي الإيرادات</td>
                  <td className="py-4 px-2 text-left">{totalIncomeCurrent.toLocaleString()}</td>
                  {isCompareMode && (
                    <>
                      <td className="py-4 px-2 text-left">{totalIncomePrev.toLocaleString()}</td>
                      <td className={`py-4 px-2 text-left ${incomeStats.diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{incomeStats.diff > 0 ? '+' : ''}{incomeStats.diff.toLocaleString()}</td>
                      <td className="py-4 px-4 text-left rounded-l-xl">{incomeStats.percent.toFixed(1)}%</td>
                    </>
                  )}
                </tr>

                {/* Gross Profit Calc */}
                <tr className="text-rose-600 dark:text-rose-400 italic">
                  <td className="py-3 px-2">يخصم: تكلفة البضاعة المباعة</td>
                  <td className="py-3 px-2 text-left">({totalCogsCurrent.toLocaleString()})</td>
                  {isCompareMode && <td colSpan={3}></td>}
                </tr>
                <tr className="border-y-2 border-slate-900 dark:border-slate-700 font-black text-xl text-emerald-700 dark:text-emerald-400">
                  <td className="py-6 px-2">مجمل الربح</td>
                  <td className="py-6 px-2 text-left">{grossProfitCurrent.toLocaleString()}</td>
                  {isCompareMode && (
                    <>
                      <td className="py-6 px-2 text-left">{grossProfitPrev.toLocaleString()}</td>
                      <td className="py-6 px-2 text-left" colSpan={2}>{grossProfitStats.percent.toFixed(1)}%</td>
                    </>
                  )}
                </tr>

                {/* Expenses Section */}
                <tr><td colSpan={isCompareMode ? 5 : 2} className="py-6 font-black text-lg text-rose-600 dark:text-rose-400">المصاريف التشغيلية</td></tr>
                {otherExpenses.map(a => (
                  <tr key={a.id} className="text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 px-2">{a.name}</td>
                    <td className="py-3 px-2 text-left font-bold">{a.current.toLocaleString()}</td>
                    {isCompareMode && (
                      <>
                        <td className="py-3 px-2 text-left opacity-60">{a.previous.toLocaleString()}</td>
                        <td className={`py-3 px-2 text-left font-bold ${a.diff > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{a.diff > 0 ? '+' : ''}{a.diff.toLocaleString()}</td>
                        <td className={`py-3 px-2 text-left font-bold ${a.diff > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                           {a.diff > 0 ? '↑' : '↓'} {Math.abs(a.percent).toFixed(1)}%
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                
                <tr className="bg-rose-50/50 dark:bg-rose-900/10 font-bold">
                  <td className="py-4 px-4 rounded-r-xl">إجمالي المصاريف</td>
                  <td className="py-4 px-2 text-left text-rose-600">({totalExpCurrent.toLocaleString()})</td>
                  {isCompareMode && (
                    <>
                      <td className="py-4 px-2 text-left">({totalExpPrev.toLocaleString()})</td>
                      <td colSpan={2} className="py-4 px-4 text-left rounded-l-xl text-xs">{expStats.percent.toFixed(1)}% زيادة في المصاريف</td>
                    </>
                  )}
                </tr>

                {/* Final Net Profit */}
                <tr><td colSpan={isCompareMode ? 5 : 2} className="py-8"></td></tr>
                <tr className={`text-white font-black text-2xl shadow-2xl ${netProfitCurrent >= 0 ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                  <td className="py-6 px-8 rounded-r-3xl">صافي الربح / (الخسارة)</td>
                  <td className="py-6 px-2 text-left">{netProfitCurrent.toLocaleString()} {currencySymbol}</td>
                  {isCompareMode && (
                    <>
                      <td className="py-6 px-2 text-left opacity-80">{netProfitPrev.toLocaleString()}</td>
                      <td className="py-6 px-2 text-left text-sm" colSpan={2}>
                        تغير بنسبة: {netProfitStats.percent.toFixed(1)}% 
                        {netProfitStats.percent > 0 ? ' 📈' : ' 📉'}
                      </td>
                    </>
                  )}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Note */}
          <div className="mt-12 text-[10px] text-slate-400 text-center uppercase tracking-widest border-t dark:border-slate-800 pt-6">
            تم استخراج هذا التقرير آلياً بواسطة نظام المحاسب الذكي - {new Date().toLocaleString('ar-SA')}
          </div>
        </div>
      </div>
    );
  };

  const renderBalanceSheet = () => {
    const assets = accounts.filter(a => a.type === AccountType.ASSET);
    const liabilities = accounts.filter(a => a.type === AccountType.LIABILITY);
    const equity = accounts.filter(a => a.type === AccountType.EQUITY);
    const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
    const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0);
    const totalEquity = equity.reduce((s, a) => s + a.balance, 0);

    return (
      <div className="space-y-6">
        <div className="flex justify-end print:hidden">
          <button onClick={handlePrint} className="bg-slate-900 dark:bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg">📄 طباعة الميزانية</button>
        </div>
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 max-w-5xl mx-auto print:bg-white print:text-black">
          <div className="text-center mb-12 border-b dark:border-slate-800 pb-8">
            <h4 className="text-emerald-600 font-bold mb-2">{companyName}</h4>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white text-center">قائمة المركز المالي</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">كما في {new Date().toLocaleDateString('ar-SA')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 print:gap-8">
            <div className="space-y-6">
              <h4 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 border-b-4 border-emerald-500 pb-2">الأصول</h4>
              {assets.map(a => (
                <div key={a.id} className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <span>{a.name}</span>
                  <span className="font-bold">{a.balance.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between py-4 font-bold text-xl bg-emerald-50 dark:bg-emerald-950/30 px-4 rounded-xl text-emerald-900 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-900/50">
                <span>إجمالي الأصول</span>
                <span>{totalAssets.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="text-xl font-bold text-amber-700 dark:text-amber-400 border-b-4 border-amber-500 pb-2 mb-4">الالتزامات وحقوق الملكية</h4>
                <div className="space-y-2">
                   <p className="text-xs font-bold text-slate-400 uppercase">الالتزامات</p>
                   {liabilities.map(a => (
                     <div key={a.id} className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                       <span>{a.name}</span>
                       <span className="font-bold">{a.balance.toLocaleString()}</span>
                     </div>
                   ))}
                </div>
                <div className="space-y-2 mt-6">
                   <p className="text-xs font-bold text-slate-400 uppercase">حقوق الملكية</p>
                   {equity.map(a => (
                     <div key={a.id} className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                       <span>{a.name}</span>
                       <span className="font-bold">{a.balance.toLocaleString()}</span>
                     </div>
                   ))}
                </div>
              </div>
              <div className="flex justify-between py-4 font-bold text-xl bg-amber-50 dark:bg-amber-950/30 px-4 rounded-xl text-amber-900 dark:text-amber-200 border border-amber-100 dark:border-amber-900/50">
                <span>إجمالي الخصوم وحقوق الملكية</span>
                <span>{(totalLiabilities + totalEquity).toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className={`mt-12 p-4 rounded-2xl text-center font-bold text-sm ${Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01 ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400 animate-pulse'}`}>
            {Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01 ? '✓ الميزانية متوازنة تماماً' : '✗ تنبيه: الميزانية غير متوازنة، راجع القيود اليومية!'}
          </div>
        </div>
      </div>
    );
  };

  const renderInventoryReport = () => {
    const categories = Array.from(new Set(inventory.map(i => i.category || 'عام')));
    const filteredInventory = inventory.filter(i => inventoryCategory === 'الكل' || i.category === inventoryCategory);
    const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:grid-cols-2">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <p className="text-slate-400 text-xs font-bold mb-1">إجمالي قيمة المخزون</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalInventoryValue.toLocaleString()} {currencySymbol}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between print:hidden">
          <div className="flex items-center gap-4 text-slate-800 dark:text-white">
            <label className="text-sm font-bold">تصفية حسب التصنيف:</label>
            <select 
              className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none"
              value={inventoryCategory}
              onChange={e => setInventoryCategory(e.target.value)}
            >
              <option value="الكل">الكل</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={handlePrint} className="bg-slate-900 dark:bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg">📄 طباعة تقرير المخزون</button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden print:bg-white print:text-black">
          <div className="p-8 border-b dark:border-slate-800">
             <h3 className="text-xl font-bold text-slate-800 dark:text-white">تقرير جرد المخزون التفصيلي</h3>
          </div>
          <table className="w-full text-right">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-8 py-4">اسم المنتج</th>
                <th className="px-8 py-4">الكمية</th>
                <th className="px-8 py-4">التكلفة</th>
                <th className="px-8 py-4">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {filteredInventory.map(item => (
                <tr key={item.id} className="text-slate-800 dark:text-slate-300">
                  <td className="px-8 py-4 font-bold">{item.name}</td>
                  <td className="px-8 py-4 font-mono">{item.quantity}</td>
                  <td className="px-8 py-4">{item.unitPrice.toLocaleString()}</td>
                  <td className="px-8 py-4 font-bold text-emerald-600 dark:text-emerald-400">{(item.quantity * item.unitPrice).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (type) {
      case 'income': return renderIncomeStatement();
      case 'balance': return renderBalanceSheet();
      case 'inventory': return renderInventoryReport();
      default: return null;
    }
  };

  return <div className="animate-in fade-in duration-500">{renderContent()}</div>;
};

export default Reports;
