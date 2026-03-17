"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';

interface PortalSession {
  clientId: string;
  studioId: string;
  bookingId: string;
  studio: {
    name: string;
    logo_url: string | null;
    phone: string | null;
  };
}

interface PortalContextType {
  session: PortalSession | null;
  isLoading: boolean;
  isValid: boolean;
  sessionToken: string | null;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export function PortalSessionProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [session, setSession] = useState<PortalSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    const verifySession = async () => {
      // 1. Try token from URL
      let token = searchParams.get('token');
      
      // 2. Try token from localStorage if not in URL
      if (!token) {
        token = localStorage.getItem('portal_token');
      }

      if (!token) {
        setIsLoading(false);
        setIsValid(false);
        return;
      }

      try {
        const res = await fetch(`/api/portal/verify?token=${token}`);
        if (!res.ok) throw new Error('Session invalid');
        
        const data = await res.json();
        setSession(data);
        setSessionToken(data.session_token || token);
        setIsValid(true);
        
        // Ensure token is stored
        localStorage.setItem('portal_token', data.session_token || token);
      } catch (error) {
        setIsValid(false);
        localStorage.removeItem('portal_token');
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [searchParams]);

  return (
    <PortalContext.Provider value={{ session, isLoading, isValid, sessionToken }}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortalSession() {
  const context = useContext(PortalContext);
  if (context === undefined) {
    throw new Error('usePortalSession must be used within a PortalSessionProvider');
  }
  return context;
}
