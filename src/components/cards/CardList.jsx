import React from 'react';
import { CreditCard, Edit3, Trash2, Plus, ArrowLeftRight } from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';

const CardList = ({ cards, loading, onEdit, onDelete, onNewCard, onOpenInvoice }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Carregando cartões...</p>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="bg-slate-800 p-5 rounded-2xl">
          <CreditCard size={36} className="text-slate-600" />
        </div>
        <p className="text-slate-400 font-medium">Nenhum cartão cadastrado</p>
        <button
          onClick={onNewCard}
          className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
        >
          + Cadastrar meu primeiro cartão
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {cards.map(card => {
        // Placeholder for spent value - would be calculated from transactions
        const spent = card.currentSpend || 0; 
        const limit = Number(card.limit_amount);
        const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
        
        return (
          <div key={card.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: card.color }} />
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard size={18} style={{ color: card.color }} />
                  {card.name}
                </h3>
                <p className="text-xs text-slate-500">{card.brand}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(card)} className="text-slate-500 hover:text-indigo-400">
                  <Edit3 size={15} />
                </button>
                <button onClick={() => onDelete(card.id)} className="text-slate-500 hover:text-rose-400">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Limite Utilizado</span>
                  <span className="text-white font-medium">{formatCurrency(spent)} / {formatCurrency(limit)}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${percent}%`, 
                      backgroundColor: percent > 90 ? '#f43f5e' : percent > 75 ? '#f59e0b' : card.color 
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <div>
                  <p className="text-slate-500 text-xs">Fechamento</p>
                  <p className="font-semibold text-white">Dia {card.closing_day}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Vencimento</p>
                  <p className="font-semibold text-white">Dia {card.due_day}</p>
                </div>
              </div>

              <button 
                onClick={() => onOpenInvoice && onOpenInvoice(card)}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors mt-2"
              >
                <ArrowLeftRight size={14} />
                Ver Fatura
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CardList;
