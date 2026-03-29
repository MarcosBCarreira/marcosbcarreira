import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Modal from '../ui/Modal';
import { ALL_CATEGORIES } from '../../lib/formatters';

const BLANK = {
  description: '',
  amount: '',
  type: 'expense',
  category: '',
  date: new Date().toISOString().split('T')[0],
};

const TransactionForm = ({ isOpen, onClose, onSaved, session, editing }) => {
  const [form, setForm]       = useState(BLANK);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(editing
      ? { description: editing.description, amount: String(editing.amount), type: editing.type, category: editing.category, date: editing.date }
      : BLANK
    );
  }, [editing, isOpen]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleTypeChange = (type) => {
    setForm(f => ({ ...f, type, category: '' }));
  };

  const handleSubmit = async () => {
    if (!form.description.trim() || !form.amount || !form.category) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount), user_id: session.user.id };
      const { error } = editing
        ? await supabase.from('transactions').update(payload).eq('id', editing.id)
        : await supabase.from('transactions').insert([payload]);
      if (error) throw error;
      onSaved();
      onClose();
    } catch (err) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = ALL_CATEGORIES[form.type] || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Editar Transação' : 'Nova Transação'}>
      <div className="space-y-5">

        {/* Type Toggle */}
        <div className="grid grid-cols-2 bg-slate-800 rounded-xl p-1 gap-1">
          {[
            { value: 'expense', label: '↘ Saída',   active: 'bg-rose-600 shadow-lg shadow-rose-600/20'    },
            { value: 'income',  label: '↗ Entrada',  active: 'bg-emerald-600 shadow-lg shadow-emerald-600/20' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleTypeChange(opt.value)}
              className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                form.type === opt.value ? `${opt.active} text-white` : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Descrição *</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Ex: Compra no supermercado"
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Valor (R$) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              placeholder="0,00"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Data *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Categoria *</label>
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <Save size={15} />
            {loading ? 'Salvando...' : editing ? 'Salvar alterações' : 'Adicionar transação'}
          </button>
          <button
            onClick={onClose}
            className="px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm font-medium border border-slate-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionForm;
