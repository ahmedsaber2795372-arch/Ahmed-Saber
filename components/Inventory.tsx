
import React, { useState } from 'react';
import { InventoryItem } from '../types';

interface InventoryProps {
  inventory: InventoryItem[];
  onUpdateInventory: (item: InventoryItem) => void;
  currencySymbol: string;
  language: 'ar' | 'en';
}

const Inventory: React.FC<InventoryProps> = ({ inventory, onUpdateInventory, currencySymbol, language }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    quantity: 0,
    unitPrice: 0,
    category: 'عام'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || (newItem.quantity || 0) < 0) return;

    onUpdateInventory({
      id: Math.random().toString(36).substr(2, 9),
      name: newItem.name!,
      quantity: Number(newItem.quantity),
      unitPrice: Number(newItem.unitPrice),
      category: newItem.category || 'عام'
    });

    setShowAddModal(false);
    setNewItem({ name: '', quantity: 0, unitPrice: 0, category: 'عام' });
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">إدارة المخزون</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">إجمالي قيمة المخزون الحالي: {totalValue.toLocaleString()} {currencySymbol}</p>
          <div className="mt-4 relative max-w-sm">
            <input 
              type="text" 
              placeholder="بحث عن منتج أو تصنيف..." 
              className="w-full pl-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-slate-800 dark:text-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-600">🔍</span>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 flex items-center"
        >
          <span className="ml-2">📦</span>
          إضافة منتج جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-slate-400 dark:text-slate-500 text-xs">عدد المنتجات</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{inventory.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-slate-400 dark:text-slate-500 text-xs">إجمالي القطع</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{inventory.reduce((s, i) => s + i.quantity, 0)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-slate-400 dark:text-slate-500 text-xs">منتجات منخفضة المخزون</p>
          <p className="text-xl font-bold text-rose-600 mt-1">{inventory.filter(i => i.quantity < 5).length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-slate-400 dark:text-slate-500 text-xs">قيمة المستودع</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{totalValue.toLocaleString()} {currencySymbol}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-sm">
            <tr>
              <th className="px-6 py-4">المنتج</th>
              <th className="px-6 py-4">التصنيف</th>
              <th className="px-6 py-4">الكمية</th>
              <th className="px-6 py-4">سعر الوحدة</th>
              <th className="px-6 py-4">إجمالي القيمة</th>
              <th className="px-6 py-4">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-600">
                  {searchTerm ? 'لم يتم العثور على نتائج للبحث.' : 'لا توجد منتجات في المخزون حالياً.'}
                </td>
              </tr>
            ) : (
              filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-slate-800 dark:text-slate-200">
                  <td className="px-6 py-4 font-bold">{item.name}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{item.category}</td>
                  <td className="px-6 py-4 font-mono">{item.quantity}</td>
                  <td className="px-6 py-4">{item.unitPrice.toLocaleString()} {currencySymbol}</td>
                  <td className="px-6 py-4 font-bold">{(item.quantity * item.unitPrice).toLocaleString()} {currencySymbol}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      item.quantity <= 0 ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' :
                      item.quantity < 5 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                    }`}>
                      {item.quantity <= 0 ? 'نافذت الكمية' : item.quantity < 5 ? 'مخزون منخفض' : 'متوفر'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl border border-white/10">
            <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">إضافة منتج للمخزون</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم المنتج</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  placeholder="مثال: آيفون 15 برو"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الكمية الافتتاحية</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                    value={newItem.quantity}
                    onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">سعر التكلفة</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                    value={newItem.unitPrice}
                    onChange={e => setNewItem({...newItem, unitPrice: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">التصنيف</label>
                <select 
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-800 dark:text-white"
                  value={newItem.category}
                  onChange={e => setNewItem({...newItem, category: e.target.value})}
                >
                  <option value="إلكترونيات">إلكترونيات</option>
                  <option value="أثاث">أثاث</option>
                  <option value="عام">عام</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                >
                  حفظ المنتج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
