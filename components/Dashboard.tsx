
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Account, AccountType, FinancialInsight } from '../types';
import { TRANSLATIONS } from '../constants';

interface DashboardProps {
  accounts: Account[];
  insights: FinancialInsight[];
  currencySymbol: string;
  language: 'ar' | 'en';
  theme: 'light' | 'dark';
}

const Dashboard: React.FC<DashboardProps> = ({ accounts, insights, currencySymbol, language, theme }) => {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const totalAssets = accounts.filter(a => a.type === AccountType.ASSET).reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.type === AccountType.LIABILITY).reduce((sum, a) => sum + a.balance, 0);
  const total_Income = accounts.filter(a => a.type === AccountType.INCOME).reduce((sum, a) => sum + a.balance, 0);
  const totalExpenses = accounts.filter(a => a.type === AccountType.EXPENSE).reduce((sum, a) => sum + a.balance, 0);
  const netProfit = total_Income - totalExpenses;

  const currentAssets = accounts
    .filter(a => a.type === AccountType.ASSET && (a.code.startsWith('11') || a.code.startsWith('12')))
    .reduce((sum, a) => sum + a.balance, 0);
  
  const fixedAssets = accounts
    .filter(a => a.type === AccountType.ASSET && a.code.startsWith('13'))
    .reduce((sum, a) => sum + a.balance, 0);

  const assetRatio = fixedAssets > 0 ? (currentAssets / fixedAssets) * 100 : 0;

  const summaryData = [
    { name: isRtl ? 'إيرادات' : 'Income', value: total_Income, color: '#10b981' },
    { name: isRtl ? 'مصروفات' : 'Expenses', value: totalExpenses, color: '#ef4444' },
    { name: isRtl ? 'صافي الربح' : 'Net Profit', value: netProfit, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: t.totalAssets, value: totalAssets, color: 'text-slate-800 dark:text-white' },
          { label: t.totalLiabilities, value: totalLiabilities, color: 'text-slate-800 dark:text-white' },
          { label: t.netProfit, value: netProfit, color: 'text-blue-600' },
          { label: t.expenses, value: totalExpenses, color: 'text-rose-500' },
          { label: isRtl ? 'نسبة التداول' : 'Current Ratio', value: assetRatio, isPercent: true, color: 'text-indigo-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition transform active:scale-95">
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-tighter">{stat.label}</p>
            <p className={`text-xl font-black mt-2 ${stat.color}`}>
              {stat.isPercent ? stat.value.toFixed(1) + '%' : stat.value.toLocaleString()} 
              {!stat.isPercent && <span className="text-[10px] text-slate-400 mr-1">{currencySymbol}</span>}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-800 dark:text-white mb-8 border-b dark:border-slate-800 pb-4">
            {isRtl ? 'المقارنة المالية' : 'Financial Comparison'}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summaryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "#33415540" : "#f1f5f9"} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: theme === 'dark' ? '#1e293b' : '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: theme === 'dark' ? '#0f172a' : 'white'}}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                  {summaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8 border-b dark:border-slate-800 pb-4">
            <h3 className="text-lg font-black text-slate-800 dark:text-white">{isRtl ? 'تحليلات ذكية' : 'Smart Analytics'} ✨</h3>
            <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Live AI</span>
          </div>
          <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar">
            {insights.map((insight, idx) => (
              <div 
                key={idx} 
                className={`p-5 rounded-2xl border-l-8 transition hover:translate-x-1 ${
                  insight.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-500 text-amber-900 dark:text-amber-100' :
                  insight.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500 text-emerald-900 dark:text-emerald-100' :
                  'bg-blue-50 dark:bg-blue-900/10 border-blue-500 text-blue-900 dark:text-blue-100'
                }`}
              >
                <h4 className="font-black text-sm mb-2">{insight.title}</h4>
                <p className="text-xs leading-relaxed font-medium opacity-80">{insight.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
