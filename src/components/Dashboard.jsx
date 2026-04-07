import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus, TrendingUp, TrendingDown, Wallet,
  ArrowUpRight, LayoutDashboard, ArrowLeftRight, CreditCard
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  formatCurrency, getFirstDayOfMonth, getLastDayOfMonth,
  getMonthName, ALL_CATEGORIES_FLAT,
} from '../lib/formatters';
import TransactionFilters from './transactions/TransactionFilters';
import TransactionForm    from './transactions/TransactionForm';
import TransactionList   from './transactions/TransactionList';
import CardList from './cards/CardList';
import CardForm from './cards/CardForm';
import CardInvoice from './cards/CardInvoice';

/* ─── Summary Card ────────────────────────────────────────────── */
const SummaryCard = ({ title, value, icon: Icon, gradient, sub }) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient} text-white`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium opacity-75">{title}</p>
        <p className="text-2xl font-bold mt-1 tracking-tight">{formatCurrency(value)}</p>
        {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
      </div>
      <div className="bg-white/15 p-2.5 rounded-xl flex-shrink-0">
        <Icon size={20} />
      </div>
    </div>
    {/* decorative blob */}
    <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
    <div className="absolute -right-2 -bottom-10 w-16 h-16 bg-white/5 rounded-full pointer-events-none" />
  </div>
);

/* ─── Category bar for dashboard overview ─────────────────────── */
const CategoryBar = ({ transactions }) => {
  const expenseByCategory = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + Number(t.amount);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [transactions]);

  const total = expenseByCategory.reduce((s, [, v]) => s + v, 0);
  if (!total) return null;

  const COLORS = [
    'bg-rose-500', 'bg-orange-400', 'bg-amber-400', 'bg-pink-500', 'bg-red-400',
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Gastos por Categoria</h3>
      <div className="space-y-3">
        {expenseByCategory.map(([cat, val], i) => (
          <div key={cat}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">{cat}</span>
              <span className="text-slate-300 font-medium">{formatCurrency(val)}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${COLORS[i % COLORS.length]} rounded-full transition-all duration-700`}
                style={{ width: `${Math.min((val / total) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Dashboard Page ──────────────────────────────────────────── */
const DashboardPage = ({ transactions, loading, month, year, onNavigate, onNewTransaction }) => {
  const income   = useMemo(() => transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0), [transactions]);
  const expenses = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0), [transactions]);
  const balance  = income - expenses;
  const recent   = useMemo(() => [...transactions].slice(0, 5), [transactions]);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <LayoutDashboard size={13} />
            <span>Visão Geral</span>
          </div>
          <h2 className="text-xl font-bold text-white capitalize">{getMonthName(month, year)}</h2>
        </div>
        <button
          onClick={onNewTransaction}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-colors"
        >
          <Plus size={16} />
          Nova Transação
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Entradas"
          value={income}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          sub={`${transactions.filter(t => t.type === 'income').length} lançamentos`}
        />
        <SummaryCard
          title="Saídas"
          value={expenses}
          icon={TrendingDown}
          gradient="bg-gradient-to-br from-rose-500 to-pink-600"
          sub={`${transactions.filter(t => t.type === 'expense').length} lançamentos`}
        />
        <SummaryCard
          title="Saldo do Mês"
          value={balance}
          icon={Wallet}
          gradient={balance >= 0
            ? 'bg-gradient-to-br from-indigo-500 to-violet-600'
            : 'bg-gradient-to-br from-orange-500 to-amber-600'}
          sub={balance >= 0 ? 'No positivo 🎉' : 'Atenção ao saldo'}
        />
      </div>

      {/* Category Breakdown + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <CategoryBar transactions={transactions} />
        </div>
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-300">Últimas Transações</h3>
            <button
              onClick={() => onNavigate('transactions')}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs font-medium"
            >
              Ver todas <ArrowUpRight size={13} />
            </button>
          </div>
          <TransactionList
            transactions={recent}
            loading={loading}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

/* ─── Transactions Page ───────────────────────────────────────── */
const TransactionsPage = ({ transactions, loading, month, year, onMonthChange, filter, onFilterChange, onEdit, onDelete, onNewTransaction }) => {
  const income   = useMemo(() => transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0), [transactions]);
  const expenses = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0), [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (filter.type !== 'all' && t.type !== filter.type) return false;
      if (filter.category && t.category !== filter.category) return false;
      return true;
    });
  }, [transactions, filter]);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <ArrowLeftRight size={13} />
            <span>Transações</span>
          </div>
          <h2 className="text-xl font-bold text-white capitalize">{getMonthName(month, year)}</h2>
        </div>
        <button
          onClick={onNewTransaction}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-colors"
        >
          <Plus size={16} />
          Nova Transação
        </button>
      </div>

      {/* Filters */}
      <TransactionFilters
        month={month}
        year={year}
        onMonthChange={onMonthChange}
        filter={filter}
        onFilterChange={onFilterChange}
      />

      {/* Mini Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-emerald-400 text-sm font-medium">Entradas</span>
          <span className="text-emerald-300 font-bold text-sm">{formatCurrency(income)}</span>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-rose-400 text-sm font-medium">Saídas</span>
          <span className="text-rose-300 font-bold text-sm">{formatCurrency(expenses)}</span>
        </div>
      </div>

      {/* List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300">
            {filtered.length} {filtered.length === 1 ? 'transação' : 'transações'}
          </h3>
        </div>
        <TransactionList
          transactions={filtered}
          loading={loading}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

/* ─── Cards Page ──────────────────────────────────────────────── */
const CardsPage = ({ cards, loading, onNewCard, onEdit, onDelete, onOpenInvoice }) => {
  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <CreditCard size={13} />
            <span>Meus Cartões</span>
          </div>
          <h2 className="text-xl font-bold text-white">Cartões de Crédito</h2>
        </div>
        <button
          onClick={onNewCard}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-colors"
        >
          <Plus size={16} />
          Novo Cartão
        </button>
      </div>

      <CardList
        cards={cards}
        loading={loading}
        onEdit={onEdit}
        onDelete={onDelete}
        onNewCard={onNewCard}
        onOpenInvoice={onOpenInvoice}
      />
    </div>
  );
};

/* ─── Main Dashboard Orchestrator ─────────────────────────────── */
const Dashboard = ({ session, activePage, onNavigate }) => {
  const now = new Date();
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [month,        setMonth]        = useState(now.getMonth() + 1);
  const [year,         setYear]         = useState(now.getFullYear());
  const [filter,       setFilter]       = useState({ type: 'all', category: '' });
  const [showForm,     setShowForm]     = useState(false);
  const [editing,      setEditing]      = useState(null);

  // Cards State
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [invoiceCard, setInvoiceCard] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('date', getFirstDayOfMonth(month, year))
        .lte('date', getLastDayOfMonth(month, year))
        .order('date', { ascending: false });
      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Erro ao carregar transações:', err.message);
    } finally {
      setLoading(false);
    }
  }, [session.user.id, month, year]);

  const fetchCards = useCallback(async () => {
    try {
      setLoadingCards(true);
      const { data: cardsData, error: cardsError } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (cardsError) throw cardsError;

      // Get current month date range to calculate spend
      const today = new Date();
      const firstDay = getFirstDayOfMonth(today.getMonth() + 1, today.getFullYear());
      const lastDay = getLastDayOfMonth(today.getMonth() + 1, today.getFullYear());

      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('credit_card_id, amount')
        .eq('user_id', session.user.id)
        .gte('date', firstDay)
        .lte('date', lastDay)
        .not('credit_card_id', 'is', null);

      const cardsWithSpend = (cardsData || []).map(card => {
        const spent = (txData || [])
          .filter(t => t.credit_card_id === card.id)
          .reduce((sum, t) => sum + Number(t.amount), 0);
        return { ...card, currentSpend: spent };
      });

      setCards(cardsWithSpend);
    } catch (err) {
      console.error('Erro ao carregar cartões:', err.message);
    } finally {
      setLoadingCards(false);
    }
  }, [session.user.id]);

  useEffect(() => { 
    fetchTransactions(); 
    fetchCards();
  }, [fetchTransactions, fetchCards]);

  const handleMonthChange = (m, y) => {
    setMonth(m);
    setYear(y);
    setFilter({ type: 'all', category: '' });
  };

  const handleEdit = (t) => { setEditing(t); setShowForm(true); };

  const handleDelete = async (id) => {
    if (!confirm('Excluir esta transação?')) return;
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      await fetchTransactions();
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const handleEditCard = (card) => { setEditingCard(card); setShowCardForm(true); };
  
  const handleDeleteCard = async (id) => {
    if (!confirm('Excluir este cartão? As transações vinculadas podem perder a referência ao limite.')) return;
    try {
      const { error } = await supabase.from('credit_cards').delete().eq('id', id);
      if (error) throw error;
      await fetchCards();
    } catch (err) {
      alert('Erro ao excluir cartão: ' + err.message);
    }
  };

  const openNew = () => { setEditing(null); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const sharedProps = {
    transactions,
    loading,
    month,
    year,
    onNewTransaction: openNew,
  };

  return (
    <>
      {activePage === 'dashboard' && (
        <DashboardPage {...sharedProps} onNavigate={onNavigate} />
      )}

      {activePage === 'transactions' && (
        <TransactionsPage
          {...sharedProps}
          onMonthChange={handleMonthChange}
          filter={filter}
          onFilterChange={setFilter}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {activePage === 'cards' && !invoiceCard && (
        <CardsPage
          cards={cards}
          loading={loadingCards}
          onNewCard={() => { setEditingCard(null); setShowCardForm(true); }}
          onEdit={handleEditCard}
          onDelete={handleDeleteCard}
          onOpenInvoice={setInvoiceCard}
        />
      )}

      {activePage === 'cards' && invoiceCard && (
        <CardInvoice 
           card={invoiceCard} 
           session={session} 
           onClose={() => setInvoiceCard(null)} 
        />
      )}

      <TransactionForm
        isOpen={showForm}
        onClose={closeForm}
        onSaved={fetchTransactions}
        session={session}
        editing={editing}
        cards={cards}
      />

      <CardForm
        isOpen={showCardForm}
        onClose={() => { setShowCardForm(false); setEditingCard(null); }}
        onSaved={fetchCards}
        session={session}
        editing={editingCard}
      />
    </>
  );
};

export default Dashboard;