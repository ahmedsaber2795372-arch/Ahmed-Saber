
import React, { useState } from 'react';
import { Account, JournalEntry } from '../types';

interface JournalEntriesProps {
  entries: JournalEntry[];
  accounts: Account[];
  onAddEntry: (entry: JournalEntry) => void;
  currencySymbol: string;
  language: 'ar' | 'en';
}

const JournalEntries: React.FC<JournalEntriesProps> = ({ entries, accounts, onAddEntry, currencySymbol, language }) => {
  const [showModal, setShowModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    description: '',
    items: [{ accountId: '', debit: 0, credit: 0 }, { accountId: '', debit: 0, credit: 0 }]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: JournalEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      description: newEntry.description,
      items: newEntry.items.filter(i => i.accountId && (i.debit > 0 || i.credit > 0))
    };
    onAddEntry(entry);
    setShowModal(false);
    setNewEntry({ description: '', items: [{ accountId: '', debit: 0, credit: 0 }, { accountId: '', debit: 0, credit: 0 }] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">سجل القيود اليومية</h3>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          إضافة قيد جديد +
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-800">
        <table className="w-full text-right">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-sm uppercase">
            <tr>
              <th className="px-6 py-4">التاريخ</th>
              <th className="px-6 py-4">البيان</th>
              <th className="px-6 py-4">الحساب</th>
              <th className="px-6 py-4">مدين</th>
              <th className="px-6 py-4">دائن</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-600">لا توجد قيود مسجلة بعد.</td>
              </tr>
            ) : (
              entries.map((entry) => (
                <React.Fragment key={entry.id}>
                  {entry.items.map((item, idx) => (
                    <tr key={`${entry.id}-${idx}`} className={`${idx === 0 ? 'border-t-2 border-slate-100 dark:border-slate-800' : ''} text-slate-800 dark:text-slate-200`}>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-500">{idx === 0 ? entry.date : ''}</td>
                      <td className="px-6 py-4 font-medium">{idx === 0 ? entry.description : ''}</td>
                      <td className="px-6 py-4">
                        {accounts.find(a => a.id === item.accountId)?.name || 'حساب غير معروف'}
                      </td>
                      <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-semibold">{item.debit > 0 ? item.debit.toLocaleString() : '-'}</td>
                      <td className="px-6 py-4 text-rose-600 dark:text-rose-400 font-semibold">{item.credit > 0 ? item.credit.toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 w-full max-w-2xl mx-4 shadow-2xl border border-white/10">
            <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">إنشاء قيد محاسبي</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">وصف القيد</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white"
                  value={newEntry.description}
                  onChange={e => setNewEntry({...newEntry, description: e.target.value})}
                  placeholder="مثال: شراء مخزون بضاعة نقداً"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex space-x-4 space-x-reverse font-bold text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex-1">الحساب</div>
                  <div className="w-32">مدين</div>
                  <div className="w-32">دائن</div>
                </div>
                {newEntry.items.map((item, idx) => (
                  <div key={idx} className="flex space-x-4 space-x-reverse">
                    <select 
                      className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-800 dark:text-white"
                      value={item.accountId}
                      onChange={e => {
                        const items = [...newEntry.items];
                        items[idx].accountId = e.target.value;
                        setNewEntry({...newEntry, items});
                      }}
                    >
                      <option value="">اختر الحساب...</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <input 
                      type="number" 
                      className="w-32 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white"
                      value={item.debit}
                      onChange={e => {
                        const items = [...newEntry.items];
                        items[idx].debit = Number(e.target.value);
                        setNewEntry({...newEntry, items});
                      }}
                    />
                    <input 
                      type="number" 
                      className="w-32 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white"
                      value={item.credit}
                      onChange={e => {
                        const items = [...newEntry.items];
                        items[idx].credit = Number(e.target.value);
                        setNewEntry({...newEntry, items});
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-4 space-x-reverse pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                  حفظ القيد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalEntries;
