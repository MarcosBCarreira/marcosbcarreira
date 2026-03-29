export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value) || 0);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day))
    .toLocaleDateString('pt-BR');
};

export const getMonthName = (month, year) => {
  return new Date(year, month - 1, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
};

export const getFirstDayOfMonth = (month, year) => {
  return `${year}-${String(month).padStart(2, '0')}-01`;
};

export const getLastDayOfMonth = (month, year) => {
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
};

export const ALL_CATEGORIES = {
  income: ['Salário', 'Freelance', 'Investimentos', 'Bônus', 'Outros'],
  expense: [
    'Alimentação', 'Transporte', 'Moradia', 'Saúde',
    'Lazer', 'Educação', 'Vestuário', 'Assinaturas', 'Outros',
  ],
};

export const ALL_CATEGORIES_FLAT = [
  ...new Set([...ALL_CATEGORIES.income, ...ALL_CATEGORIES.expense]),
];
