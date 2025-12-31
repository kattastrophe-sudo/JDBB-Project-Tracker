import React, { useState } from 'react';
import { Database, Save, AlertCircle, CheckCircle, PlusCircle, LogIn } from 'lucide-react';
import { useAuth } from '../data';
import { Button } from '../components';
import { saveConfiguration, clearConfiguration, COLORS } from '../config';

// --- Setup Screen ---
export const SetupScreen = () => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  
  const handleSave = (e) => {
    e.preventDefault();
    if(url && key) saveConfiguration(url, key);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-lg shadow-2xl border border-slate-700">
        <div className="flex items-center gap-3 mb-6 text-emerald-400">
          <Database size={32} />
          <h1 className="text-2xl font-bold">Connect Database</h1>
        </div>
        <p className="text-slate-400 mb-6">
          To run the JDBB Project Tracker, you need to connect your Supabase project. 
          Enter your API details below.
        </p>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Project URL</label>
            <input 
              type="text" 
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm focus:border-emerald-500 outline-none transition-colors"
              placeholder="https://xyz.supabase.co"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Anon Key</label>
            <input 
              type="password" 
              value={key}
              onChange={e => setKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm focus:border-emerald-500 outline-none transition-colors"
              placeholder="eyJxh..."
              required
            />
          </div>
          <Button type="submit" variant="primary" fullWidth><Save size={16}/> Connect & Restart</Button>
        </form>
        <div className="mt-6 text-xs text-slate-500 text-center">
          These keys will be saved to your browser's Local Storage.
        </div>
      </div>
    </div>
  );
};

// --- Login / Register Screen ---
export const LoginScreen = () => {
  const { login, signUp } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setMsg('');
      setLoading(true);
      try {
          if (isRegistering) {
            await signUp(email, password, fullName);
            setMsg("Account created! You may need to verify your email, or you can try signing in now.");
            setIsRegistering(false); // Switch back to login
          } else {
            await login(email, password);
          }
      } catch (err) {
          setError(err.message || "Failed to authenticate");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-lg shadow-lg border-t-4 transition-colors" style={{ borderColor: COLORS.emerald }}>
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-600 text-white font-bold text-lg shadow-lg mb-4">JD</div>
          <h1 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">JDBB Project Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400">{isRegistering ? "Create your student account." : "Sign in to access your dashboard."}</p>
          <button onClick={clearConfiguration} className="absolute top-0 right-0 text-slate-300 hover:text-red-500 text-xs" title="Reset Database Connection"><Database size={14}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-200 text-sm p-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                </div>
            )}
             {msg && (
                <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-200 text-sm p-3 rounded-lg flex items-center gap-2">
                    <CheckCircle size={16} /> {msg}
                </div>
            )}
            
            {isRegistering && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                  <input 
                      type="text" 
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)} 
                      className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 transition-colors"
                      required={isRegistering}
                      placeholder="Jane Doe"
                  />
              </div>
            )}

            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Email</label>
                <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 transition-colors"
                    required
                    placeholder="student@college.edu"
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Password</label>
                <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 transition-colors"
                    required
                    placeholder="••••••••"
                />
            </div>
            <Button type="submit" variant="primary" fullWidth disabled={loading}>
                {loading ? 'Processing...' : (isRegistering ? <><PlusCircle size={18} /> Create Account</> : <><LogIn size={18} /> Sign In</>)}
            </Button>
        </form>
        
        <div className="mt-6 text-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => { setIsRegistering(!isRegistering); setError(''); setMsg(''); }} className="text-sm font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">
               {isRegistering ? "Already have an account? Sign In" : "Need an account? Sign Up"}
            </button>
        </div>
      </div>
    </div>
  );
};
