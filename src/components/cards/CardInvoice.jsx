import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, CreditCard, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency, getFirstDayOfMonth, getLastDayOfMonth, getMonthName } from '../../lib/formatters';
import TransactionList from '../transactions/TransactionList';

const CardInvoice = ({ card, session, onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const fetchInvoice = useCallback(async () => {
    setLoading(true);
    try {
      const start = getFirstDayOfMonth(month, year);
      const end = getLastDayOfMonth(month, year);

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('credit_card_id', card.id)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Erro ao carregar fatura:', err.message);
    } finally {
      setLoading(false);
    }
  }, [session.user.id, card.id, month, year]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const limit = Number(card.limit_amount);
  const percent = limit > 0 ? Math.min((total / limit) * 100, 100) : 0;

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); } 
    else { setMonth(m => m - 1); }
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); } 
    else { setMonth(m => m + 1); }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onClose}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <CreditCard size={13} style={{ color: card.color }} />
            <span>Fatura do Cartão</span>
          </div>
          <h2 className="text-xl font-bold text-white">{card.name}</h2>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: card.color }} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total da Fatura Atual</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(total)}</p>
            <p className="text-sm text-slate-500 mt-1">Limite: {formatCurrency(limit)}</p>
            
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Uso do Limite</span>
                <span className="text-white">{percent.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percent}%`, backgroundColor: card.color }}
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Fechamento</p>
              <p className="font-semibold text-white">Dia {card.closing_day}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Vencimento</p>
              <p className="font-semibold text-white">Dia {card.due_day}</p>
            </div>
            <div className="col-span-2 mt-2 pt-2 border-t border-slate-700/50 flex items-center gap-2">
               <Calendar size={14} className="text-slate-500" />
               <span className="text-slate-400 text-xs">Vencimento cai no próximo mês dependendo da compra. (Em breve simulação precisa)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navegador de Meses Fechados */}
      <div className="flex items-center gap-2">
        <button onClick={prevMonth} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors">
          &larr; Anterior
        </button>
        <div className="flex-1 text-center font-semibold text-white capitalize bg-slate-900 border border-slate-800 py-1.5 rounded-lg">
          {getMonthName(month, year)}
        </div>
        <button onClick={nextMonth} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors">
          Próximo &rarr;
        </button>
      </div>

      {/* Lista de Transações */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <TransactionList 
          transactions={transactions} 
          loading={loading}
          onEdit={() => alert('Edite a compra pelo menu principal de Transações.')}
          onDelete={() => alert('Exclua a compra pelo menu principal de Transações.')}
        />
      </div>

    </div>
  );
};

export default CardInvoice;
