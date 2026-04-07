import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Modal from '../ui/Modal';

const BLANK_CARD = {
  name: '',
  brand: 'Visa',
  limit_amount: '',
  closing_day: 1,
  due_day: 10,
  color: '#6366f1', // default indigo
};

const CardForm = ({ isOpen, onClose, onSaved, session, editing }) => {
  const [form, setForm] = useState(BLANK_CARD);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(editing
      ? {
          name: editing.name,
          brand: editing.brand || 'Visa',
          limit_amount: String(editing.limit_amount),
          closing_day: editing.closing_day,
          due_day: editing.due_day,
          color: editing.color || '#6366f1'
        }
      : BLANK_CARD
    );
  }, [editing, isOpen]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.limit_amount) {
      alert('Preencha os campos obrigatórios (Nome e Limite).');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        limit_amount: parseFloat(form.limit_amount),
        closing_day: parseInt(form.closing_day, 10),
        due_day: parseInt(form.due_day, 10),
        user_id: session.user.id
      };

      const { error } = editing
        ? await supabase.from('credit_cards').update(payload).eq('id', editing.id)
        : await supabase.from('credit_cards').insert([payload]);

      if (error) throw error;
      onSaved();
      onClose();
    } catch (err) {
      alert('Erro ao salvar cartão: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Editar Cartão' : 'Novo Cartão'}>
      <div className="space-y-4">
        {/* Name and Brand */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Nome *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ex: Nubank, Inter..."
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Bandeira</label>
            <select
              value={form.brand}
              onChange={(e) => set('brand', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
              <option value="Elo">Elo</option>
              <option value="American Express">Amex</option>
              <option value="Outra">Outra</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Limit and Color */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Limite (R$) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.limit_amount}
              onChange={(e) => set('limit_amount', e.target.value)}
              placeholder="0,00"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Cor de Identificação</label>
            <div className="flex bg-slate-800 border border-slate-700 rounded-xl overflow-hidden px-2 py-1.5 h-[42px]">
               <input
                type="color"
                value={form.color}
                onChange={(e) => set('color', e.target.value)}
                className="w-full h-full cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Closing Day and Due Day */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Dia do Fechamento</label>
            <input
              type="number"
              min="1" max="31"
              value={form.closing_day}
              onChange={(e) => set('closing_day', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Dia do Vencimento</label>
            <input
              type="number"
              min="1" max="31"
              value={form.due_day}
              onChange={(e) => set('due_day', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <Save size={15} />
            {loading ? 'Salvando...' : editing ? 'Salvar alterações' : 'Registrar cartão'}
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

export default CardForm;
