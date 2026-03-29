import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleAuth = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError('✅ Cadastro realizado! Verifique seu e-mail para confirmar.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900/60 via-slate-900 to-violet-900/40 flex-col justify-between p-12 border-r border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/25">
            <TrendingUp size={20} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">FinanceApp</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Controle suas<br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              finanças pessoais
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            Acompanhe entradas, saídas, cartões e muito mais — tudo sincronizado na nuvem.
          </p>

          <div className="space-y-3">
            {['Controle total de receitas e despesas', 'Filtros por mês e categoria', 'Sincronização em tempo real'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                <span className="text-slate-300 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs">© 2025 FinanceApp. Todos os direitos reservados.</p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2 rounded-xl">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="font-bold text-white">FinanceApp</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              {isSignUp ? 'Criar conta' : 'Bem-vindo de volta'}
            </h2>
            <p className="text-slate-400 mt-1 text-sm">
              {isSignUp ? 'Preencha os dados para começar' : 'Entre na sua conta para continuar'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-10 pr-10 py-2.5 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error / Info message */}
            {error && (
              <p className={`text-sm px-3 py-2 rounded-lg ${error.startsWith('✅') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-colors mt-2"
            >
              {loading ? 'Aguarde...' : isSignUp ? 'Criar conta' : 'Entrar'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm">
            {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem conta?'}{' '}
            <button
              onClick={() => { setIsSignUp(v => !v); setError(''); }}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              {isSignUp ? 'Fazer login' : 'Criar conta'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;