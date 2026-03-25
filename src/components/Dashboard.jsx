import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar, Tag, Trash2, Edit3, Save, X, LogOut } from 'lucide-react';

const Dashboard = ({ session }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: 'expense',
        category: '',
        date: new Date().toISOString().split('T')[0]
    });

    const categories = {
        income: ['Salário', 'Freelance', 'Investimentos', 'Outros'],
        expense: ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Educação', 'Outros']
    };

    // Carregar transações
    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', session.user.id)
                .order('date', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            alert('Erro ao carregar transações: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.description || !formData.amount || !formData.category) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }

        try {
            const transactionData = {
                ...formData,
                amount: parseFloat(formData.amount),
                user_id: session.user.id
            };

            if (editingId) {
                // Atualizar
                const { error } = await supabase
                    .from('transactions')
                    .update(transactionData)
                    .eq('id', editingId);

                if (error) throw error;
            } else {
                // Inserir
                const { error } = await supabase
                    .from('transactions')
                    .insert([transactionData]);

                if (error) throw error;
            }

            // Recarregar lista
            await fetchTransactions();

            // Limpar formulário
            setFormData({
                description: '',
                amount: '',
                type: 'expense',
                category: '',
                date: new Date().toISOString().split('T')[0]
            });
            setEditingId(null);
            setShowForm(false);
        } catch (error) {
            alert('Erro ao salvar: ' + error.message);
        }
    };

    const handleEdit = (transaction) => {
        setFormData({
            description: transaction.description,
            amount: transaction.amount.toString(),
            type: transaction.type,
            category: transaction.category,
            date: transaction.date
        });
        setEditingId(transaction.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchTransactions();
        } catch (error) {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            description: '',
            amount: '',
            type: 'expense',
            category: '',
            date: new Date().toISOString().split('T')[0]
        });
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const balance = totalIncome - totalExpenses;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Carregando transações...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div></div>
                        <div className="text-center flex-1">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestão Financeira Pessoal</h1>
                            <p className="text-gray-600">Olá, {session.user.email}</p>
                            <p className="text-xs text-green-600 mt-1">✓ Sincronizado com a nuvem</p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm">Sair</span>
                        </button>
                    </div>
                </div>

                {/* Cards de Resumo */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100">Entradas</p>
                                <p className="text-2xl font-bold">R$ {totalIncome.toFixed(2)}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-200" />
                        </div>
                    </div>

                    <div className="bg-red-500 text-white p-6 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100">Saídas</p>
                                <p className="text-2xl font-bold">R$ {totalExpenses.toFixed(2)}</p>
                            </div>
                            <TrendingDown className="h-8 w-8 text-red-200" />
                        </div>
                    </div>

                    <div className={`${balance >= 0 ? 'bg-blue-500' : 'bg-orange-500'} text-white p-6 rounded-lg shadow-lg`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={balance >= 0 ? 'text-blue-100' : 'text-orange-100'}>Saldo</p>
                                <p className="text-2xl font-bold">R$ {balance.toFixed(2)}</p>
                            </div>
                            <DollarSign className={`h-8 w-8 ${balance >= 0 ? 'text-blue-200' : 'text-orange-200'}`} />
                        </div>
                    </div>
                </div>

                {/* Botão Nova Transação */}
                <div className="text-center mb-8">
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center mx-auto space-x-2 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        <span>Nova Transação</span>
                    </button>
                </div>

                {/* Formulário */}
                {showForm && (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingId ? 'Editar Transação' : 'Nova Transação'}
                            </h2>
                            <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descrição *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Ex: Compra no supermercado"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valor (R$) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="0,00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo *
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="expense">Saída</option>
                                        <option value="income">Entrada</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Categoria *
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Selecione uma categoria</option>
                                        {categories[formData.type].map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleSubmit}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>{editingId ? 'Atualizar' : 'Salvar'}</span>
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista de Transações */}
                <div className="bg-white rounded-lg shadow-lg">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">Histórico de Transações</h2>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            <p>Nenhuma transação registrada ainda.</p>
                            <p>Clique em "Nova Transação" para começar.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {transactions.map(transaction => (
                                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-full ${transaction.type === 'income'
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {transaction.type === 'income' ? (
                                                        <TrendingUp className="h-4 w-4" />
                                                    ) : (
                                                        <TrendingDown className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{transaction.description}</p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span className="flex items-center">
                                                            <Tag className="h-3 w-3 mr-1" />
                                                            {transaction.category}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {new Date(transaction.date).toLocaleDateString('pt-BR')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <span className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {transaction.type === 'income' ? '+' : '-'}R$ {parseFloat(transaction.amount).toFixed(2)}
                                            </span>

                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(transaction)}
                                                    className="text-blue-600 hover:text-blue-800 p-1"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(transaction.id)}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;