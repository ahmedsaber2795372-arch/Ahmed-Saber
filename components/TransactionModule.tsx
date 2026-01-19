
import React, { useState, useMemo } from 'react';
import { Account, AccountType, JournalEntry, InventoryItem } from '../types';

interface TransactionModuleProps {
  type: 'sales' | 'purchases';
  accounts: Account[];
  inventory: InventoryItem[];
  entries: JournalEntry[];
  onAddEntry: (entry: JournalEntry, inventoryUpdate?: { itemId: string, qty: number, price?: number }) => void;
  currencySymbol: string;
  language: 'ar' | 'en';
}

const TransactionModule: React.FC<TransactionModuleProps> = ({ type, accounts, inventory, entries, onAddEntry, currencySymbol, language }) => {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('1'); 

  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterPaymentId, setFilterPaymentId] = useState('الكل');
  const [filterSearch, setFilterSearch] = useState('');

  const selectedItem = inventory.find(i => i.id === selectedItemId);
  const totalAmount = quantity * unitPrice;
  const isSale = type === 'sales';

  const moduleEntries = useMemo(() => {
    return entries.filter(entry => {
      const isSalesEntry = entry.items.some(i => i.accountId === '8') || entry.description.includes('مبيعات');
      const isPurchasesEntry = (entry.items.some(i => i.accountId === '3' && i.debit > 0) && !isSalesEntry) || entry.description.includes('مشتريات');
      
      if (isSale && !isSalesEntry) return false;
      if (!isSale && !isPurchasesEntry) return false;

      if (filterStartDate && entry.date < filterStartDate) return false;
      if (filterEndDate && entry.date > filterEndDate) return false;
      if (filterPaymentId !== 'الكل' && !entry.items.some(i => i.accountId === filterPaymentId)) return false;
      if (filterSearch && !entry.description.toLowerCase().includes(filterSearch.toLowerCase())) return false;

      return true;
    });
  }, [entries, isSale, filterStartDate, filterEndDate, filterPaymentId, filterSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalAmount <= 0 || !selectedItemId) return;

    if (isSale && selectedItem && selectedItem.quantity < quantity) {
      alert('الكمية المطلوبة غير متوفرة في المخزون!');
      return;
    }

    const mainEntry: JournalEntry = {
      id: `TRX-${Math.random().toString(36).substr(2, 5)}`,
      date: new Date().toISOString().split('T')[0],
      description: description || `${isSale ? 'مبيعات' : 'مشتريات'} - ${selectedItem?.name}`,
      items: isSale ? [
        { accountId: paymentMethod, debit: totalAmount, credit: 0 }, 
        { accountId: '8', debit: 0, credit: totalAmount }           
      ] : [
        { accountId: '3', debit: totalAmount, credit: 0 },          
        { accountId: paymentMethod, debit: 0, credit: totalAmount }  
      ]
    };

    if (isSale && selectedItem) {
      const costAmount = quantity * selectedItem.unitPrice;
      const inventoryEntry: JournalEntry = {
        id: `INV-${Math.random().toString(36).substr(2, 5)}`,
        date: new Date().toISOString().split('T')[0],
        description: `تكلفة مبيعات - ${selectedItem.name}`,
        items: [
          { accountId: '14', debit: costAmount, credit: 0 }, 
          { accountId: '3', debit: 0, credit: costAmount }  
        ]
      };
      onAddEntry(mainEntry);
      onAddEntry(inventoryEntry, { itemId: selectedItemId, qty: -quantity });
    } else {
      onAddEntry(mainEntry, { itemId: selectedItemId, qty: quantity, price: unitPrice });
    }

    setQuantity(0);
    setUnitPrice(0);
    setDescription('');
    setSelectedItemId('');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition hover:shadow-md">
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${isSale ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'}`}>
            {isSale ? '💰' : '🛒'}
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{isSale ? 'إصدار فاتورة مبيعات' : 'تسجيل فاتورة مشتريات'}</h3>
            <p className="text-slate-400 dark:text-slate-500 font-medium">نظام الجرد المستمر - الترحيل الآلي للقيود</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">المنتج من المخزون</label>
            <select 
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white transition"
              value={selectedItemId}
              onChange={e => {
                const item = inventory.find(i => i.id === e.target.value);
                setSelectedItemId(e.target.value);
                if (type === 'purchases' && item) setUnitPrice(item.unitPrice);
              }}
            >
              <option value="">اختر منتجاً...</option>
              {inventory.map(item => (
                <option key={item.id} value={item.id}>{item.name} (المتوفر: {item.quantity})</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">الكمية</label>
              <input 
                type="number" required min="1"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white"
                value={quantity || ''}
                onChange={e => setQuantity(Number(e.target.value))}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">السعر</label>
              <input 
                type="number" required step="0.01"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white"
                value={unitPrice || ''}
                onChange={e => setUnitPrice(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">طريقة التحصيل / الدفع</label>
            <select 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
            >
              {accounts.filter(a => a.type === AccountType.ASSET && a.code.startsWith('11')).map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">البيان / الملاحظات</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="وصف العملية..."
            />
          </div>

          <div className="flex items-end">
            <button 
              type="submit"
              className={`w-full py-3.5 rounded-xl font-black text-white transition transform active:scale-95 shadow-lg ${
                isSale ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 dark:shadow-emerald-900/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200 dark:shadow-rose-900/20'
              }`}
            >
              {isSale ? 'حفظ الفاتورة' : 'شراء البضاعة'} | {totalAmount.toLocaleString()} {currencySymbol}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="bg-slate-900 dark:bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4 border border-slate-800">
          <div className="flex justify-between items-center">
            <h4 className="font-bold flex items-center gap-2">
              <span>🔍</span>
              سجل {isSale ? 'المبيعات' : 'المشتريات'} المتقدم
            </h4>
            <span className="bg-slate-800 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-mono text-slate-400">
              عدد النتائج: {moduleEntries.length}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-bold uppercase">من تاريخ</label>
              <input 
                type="date" 
                className="w-full bg-slate-800 border-none rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-emerald-500"
                value={filterStartDate}
                onChange={e => setFilterStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-bold uppercase">إلى تاريخ</label>
              <input 
                type="date" 
                className="w-full bg-slate-800 border-none rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-emerald-500"
                value={filterEndDate}
                onChange={e => setFilterEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-bold uppercase">طريقة الدفع</label>
              <select 
                className="w-full bg-slate-800 border-none rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-emerald-500"
                value={filterPaymentId}
                onChange={e => setFilterPaymentId(e.target.value)}
              >
                <option value="الكل">جميع الطرق</option>
                {accounts.filter(a => a.type === AccountType.ASSET && a.code.startsWith('11')).map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-bold uppercase">بحث نصي</label>
              <input 
                type="text" 
                placeholder="ابحث بالوصف..."
                className="w-full bg-slate-800 border-none rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 placeholder-slate-600"
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">رقم القيد</th>
                <th className="px-6 py-4">وصف العملية</th>
                <th className="px-6 py-4">المبلغ</th>
                <th className="px-6 py-4">طريقة الدفع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {moduleEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-300 dark:text-slate-600 italic">لا توجد سجلات مطابقة للفلاتر المختارة</td>
                </tr>
              ) : (
                moduleEntries.map(entry => {
                  const paymentAccount = entry.items.find(i => accounts.some(a => a.id === i.accountId && a.code.startsWith('11')));
                  const amount = entry.items.reduce((max, item) => Math.max(max, item.debit, item.credit), 0);
                  
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-slate-800 dark:text-slate-200">
                      <td className="px-6 py-4 text-slate-400 dark:text-slate-500 font-mono">{entry.date}</td>
                      <td className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400">#{entry.id}</td>
                      <td className="px-6 py-4 font-medium">{entry.description}</td>
                      <td className="px-6 py-4">
                        <span className={`font-black text-lg ${isSale ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {amount.toLocaleString()}
                        </span>
                        <span className="mr-1 text-[10px] text-slate-400 dark:text-slate-500">{currencySymbol}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded text-xs">
                          {accounts.find(a => a.id === paymentAccount?.accountId)?.name || 'غير محدد'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default TransactionModule;
