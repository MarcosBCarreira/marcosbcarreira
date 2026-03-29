import React from 'react';
import { TrendingUp, TrendingDown, Edit3, Trash2, Inbox } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/formatters';

const CAT_COLORS = {
  Alimentação:  'bg-orange-500/10 text-orange-400',
  Transporte:   'bg-blue-500/10 text-blue-400',
  Moradia:      'bg-purple-500/10 text-purple-400',
  Saúde:        'bg-red-500/10 text-red-400',
  Lazer:        'bg-pink-500/10 text-pink-400',
  Educação:     'bg-cyan-500/10 text-cyan-400',
  Vestuário:    'bg-yellow-500/10 text-yellow-400',
  Assinaturas:  'bg-indigo-500/10 text-indigo-400',
  Salário:      'bg-emerald-500/10 text-emerald-400',
  Freelance:    'bg-teal-500/10 text-teal-400',
  Investimentos:'bg-violet-500/10 text-violet-400',
  Bônus:        'bg-lime-500/10 text-lime-400',
  Outros:       'bg-slate-500/10 text-slate-400',
};

const TransactionList = ({ transactions, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Carregando...</p>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="bg-slate-800 p-5 rounded-2xl">
          <Inbox size={36} className="text-slate-600" />
        </div>
        <p className="text-slate-400 font-medium">Nenhuma transação encontrada</p>
        <p className="text-slate-600 text-sm">Adicione uma transação para começar.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-800/80">
      {transactions.map((t) => {
        const income = t.type === 'income';
        const catCls = CAT_COLORS[t.category] ?? CAT_COLORS['Outros'];

        return (
          <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-800/40 group transition-colors">

            {/* Icon */}
            <div className={`p-2.5 rounded-xl flex-shrink-0 ${income ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {income ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{t.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${catCls}`}>
                  {t.category}
                </span>
                <span className="text-slate-600 text-xs">{formatDate(t.date)}</span>
              </div>
            </div>

            {/* Amount */}
            <span className={`text-sm font-bold flex-shrink-0 ${income ? 'text-emerald-400' : 'text-rose-400'}`}>
              {income ? '+ ' : '− '}{formatCurrency(t.amount)}
            </span>

            {/* Hover Actions */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(t)}
                className="p-1.5 text-slate-600 hover:text-indigo-400 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Edit3 size={13} />
              </button>
              <button
                onClick={() => onDelete(t.id)}
                className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;
