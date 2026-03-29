import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthName, ALL_CATEGORIES_FLAT } from '../../lib/formatters';

const TYPE_OPTS = [
  { value: 'all',     label: 'Tudo'     },
  { value: 'income',  label: 'Entradas' },
  { value: 'expense', label: 'Saídas'   },
];

const TransactionFilters = ({ month, year, onMonthChange, filter, onFilterChange }) => {
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const prev = () => month === 1 ? onMonthChange(12, year - 1) : onMonthChange(month - 1, year);
  const next = () => {
    if (isCurrentMonth) return;
    month === 12 ? onMonthChange(1, year + 1) : onMonthChange(month + 1, year);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">

      {/* Month Navigator */}
      <div className="flex items-center bg-slate-800 border border-slate-700/60 rounded-xl overflow-hidden">
        <button onClick={prev} className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700">
          <ChevronLeft size={16} />
        </button>
        <span className="px-4 py-2 text-sm font-medium text-white capitalize min-w-[155px] text-center">
          {getMonthName(month, year)}
        </span>
        <button
          onClick={next}
          disabled={isCurrentMonth}
          className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-25 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Type Filter */}
      <div className="flex bg-slate-800 border border-slate-700/60 rounded-xl overflow-hidden">
        {TYPE_OPTS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onFilterChange({ ...filter, type: opt.value })}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              filter.type === opt.value
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Category */}
      <select
        value={filter.category}
        onChange={(e) => onFilterChange({ ...filter, category: e.target.value })}
        className="bg-slate-800 border border-slate-700/60 text-slate-300 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
      >
        <option value="">Todas categorias</option>
        {ALL_CATEGORIES_FLAT.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  );
};

export default TransactionFilters;
