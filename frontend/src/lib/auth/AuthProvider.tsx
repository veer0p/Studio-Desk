import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authLogin, authLogout, authMe } from '@/lib/api/endpoints/auth';
import type { MeResponse } from '@/types/domain';
import type { LoginInput } from '@/lib/validations/auth.schema';

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthState {
  me: MeResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (data: LoginInput) => Promise<MeResponse>;
  logout: () => Promise<void>;
  refetchMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const UNAUTHENTICATED: AuthState = {
  me: null,
  isLoading: false,
  isAuthenticated: false,
};

// ─── Provider (root layout route) ────────────────────────────────────────────

/**
 * Rendered as the root layout route element. Must be inside the Router so that
 * useNavigate() and useQueryClient() work.
 *
 * On mount it calls GET /auth/me:
 *   - 200 → sets isAuthenticated = true
 *   - 401 → sets isAuthenticated = false (ProtectedOutlet redirects to /login)
 *
 * Listens for the 'auth:unauthorized' event dispatched by the API client on 401
 * so mid-session expiry clears state and redirects cleanly.
 */
export function AuthProviderLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({ me: null, isLoading: true, isAuthenticated: false });
  const bootstrapped = useRef(false);

  const setAuthenticated = useCallback((me: MeResponse) => {
    setState({ me, isLoading: false, isAuthenticated: true });
  }, []);

  const setUnauthenticated = useCallback(() => {
    setState(UNAUTHENTICATED);
  }, []);

  // Bootstrap: check existing session on mount
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    authMe()
      .then(setAuthenticated)
      .catch(() => setState({ ...UNAUTHENTICATED, isLoading: false }));
  }, [setAuthenticated]);

  // Listen for 401 events dispatched by the API client
  useEffect(() => {
    const handler = () => {
      setUnauthenticated();
      queryClient.clear();
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [navigate, queryClient, setUnauthenticated]);

  const login = useCallback(async (data: LoginInput): Promise<MeResponse> => {
    const me = await authLogin(data);
    setAuthenticated(me);
    return me;
  }, [setAuthenticated]);

  const logout = useCallback(async () => {
    try {
      await authLogout();
    } catch {
      // Swallow logout errors — clear state regardless
    }
    setUnauthenticated();
    queryClient.clear();
  }, [setUnauthenticated, queryClient]);

  const refetchMe = useCallback(async () => {
    try {
      const me = await authMe();
      setAuthenticated(me);
    } catch {
      setUnauthenticated();
    }
  }, [setAuthenticated, setUnauthenticated]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refetchMe }}>
      <Outlet />
    </AuthContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProviderLayout');
  return ctx;
}

const EMPTY_ME: MeResponse = {
  user: { id: '', email: '', full_name: '', phone: null, designation: null },
  studio: null,
  member: null,
};

/**
 * Returns the current session data (or EMPTY_ME while loading).
 * Components inside ProtectedOutlet are guaranteed to have real data.
 */
export function useMe() {
  const { me, isLoading, isAuthenticated } = useAuth();
  return {
    data: me ?? EMPTY_ME,
    isLoading,
    isError: !isAuthenticated && !isLoading,
    isDevAuth: false as const,
  };
}
