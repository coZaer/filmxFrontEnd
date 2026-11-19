import { useEffect, useState, type FormEvent } from 'react';
import { Lock, Mail, User, X } from 'lucide-react';
import type { BackendMode, LoginRequest, RegisterRequest } from '../types/film';
import { validateAuthForm, type AuthValidationErrors } from '../utils/filmLogic';

interface AuthModalProps {
  isOpen: boolean;
  mode: BackendMode;
  isSubmitting: boolean;
  onClose: () => void;
  onLogin: (payload: LoginRequest) => Promise<boolean>;
  onRegister: (payload: RegisterRequest) => Promise<boolean>;
}

export function AuthModal({
  isOpen,
  mode,
  isSubmitting,
  onClose,
  onLogin,
  onRegister,
}: AuthModalProps) {
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthValidationErrors>({});

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
  }, [isOpen, authTab]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateAuthForm(authTab, {
      userName,
      email,
      password,
    });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    if (authTab === 'login') {
      const ok = await onLogin({ email: email.trim(), password });
      if (ok) {
        setPassword('');
        onClose();
      }
    } else {
      const ok = await onRegister({
        userName: userName.trim(),
        email: email.trim(),
        password,
      });
      if (ok) {
        setAuthTab('login');
        setPassword('');
      }
    }
  };

  const fillDemoCredentials = () => {
    setAuthTab('login');
    setEmail('alex@filmx.io');
    setPassword('password123');
    setErrors({});
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-xs"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="cinema-modal w-full max-w-md rounded-2xl border border-slate-200 p-6 sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="auth-modal-title"
              className="font-display text-xl font-bold text-slate-900"
            >
              {authTab === 'login' ? 'Sign in to Filmx' : 'Create Studio Account'}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {mode === 'live'
                ? 'Authenticating against localhost:8080/api/auth'
                : 'Demo Mode authentication'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close authentication modal"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-amber-600"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div
          className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1"
          role="tablist"
          aria-label="Authentication mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={authTab === 'login'}
            onClick={() => setAuthTab('login')}
            className={`min-h-[38px] rounded-lg text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-amber-600 ${
              authTab === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={authTab === 'register'}
            onClick={() => setAuthTab('register')}
            className={`min-h-[38px] rounded-lg text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-amber-600 ${
              authTab === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          {authTab === 'register' && (
            <div>
              <label
                htmlFor="auth-username"
                className="block text-xs font-semibold text-slate-700"
              >
                Username
              </label>
              <div className="relative mt-1.5">
                <User
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="auth-username"
                  type="text"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    if (errors.userName) setErrors((prev) => ({ ...prev, userName: undefined }));
                  }}
                  placeholder="Alex Mercer"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              {errors.userName && (
                <p className="mt-1 text-xs text-rose-600" role="alert">
                  {errors.userName}
                </p>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="block text-xs font-semibold text-slate-700"
            >
              Email
            </label>
            <div className="relative mt-1.5">
              <Mail
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="alex@filmx.io"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-600" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="block text-xs font-semibold text-slate-700"
            >
              Password
            </label>
            <div className="relative mt-1.5">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="At least 6 characters"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-600" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          {mode === 'demo' && authTab === 'login' && (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <span>
                Demo account: <code className="font-mono font-semibold text-amber-800">alex@filmx.io</code>
              </span>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="font-semibold text-amber-700 hover:text-amber-900 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-amber-600 rounded"
              >
                Use Demo
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-lg bg-amber-500 px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-amber-600"
          >
            {isSubmitting
              ? authTab === 'login'
                ? 'Signing in...'
                : 'Creating account...'
              : authTab === 'login'
                ? 'Sign In'
                : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
