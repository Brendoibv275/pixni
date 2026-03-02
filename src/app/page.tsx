'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Tv, Presentation } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [pin, setPin] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim()) {
      router.push(`/join?pin=${pin.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Background Decorativo e Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-slate-950">
        <div className="absolute top-[-10%] sm:top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] sm:w-[50vw] sm:h-[50vw] rounded-full bg-blue-600/20 blur-[100px] pointer-events-none"></div>
      </div>

      <div className="w-full max-w-sm bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <Tv className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">PIXNI Academy</h1>
          <p className="text-slate-400 text-sm mt-1 text-center font-medium">
            Sua jornada de aprendizado foda.
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 ml-1 uppercase tracking-wider">
              Tem o código da aula?
            </label>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value.toUpperCase())}
              placeholder="Digite aqui..."
              maxLength={10}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-center tracking-widest text-lg"
            />
          </div>

          <button
            type="submit"
            disabled={!pin.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            Avançar
            <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>

      <div className="mt-8">
        <Link
          href="/admin"
          className="text-slate-500 hover:text-slate-300 transition-colors text-sm flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-900"
        >
          <Presentation className="w-4 h-4" /> Acesso Professor
        </Link>
      </div>
    </div>
  );
}
