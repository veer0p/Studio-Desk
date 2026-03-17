"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database";

type Studio = Database["public"]["Tables"]["studios"]["Row"];
type Member = Database["public"]["Tables"]["studio_members"]["Row"];

interface StudioContextType {
  studio: Studio | null;
  member: Member | null;
  role: string | null;
  isOwner: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const StudioContext = createContext<StudioContextType>({
  studio: null,
  member: null,
  role: null,
  isOwner: false,
  isLoading: true,
  refresh: async () => {},
});

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const [studio, setStudio] = useState<Studio | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStudio(null);
        setMember(null);
        return;
      }

      // 1. Get member details
      const { data: memberData, error: memberError } = await supabase
        .from("studio_members")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (memberError) throw memberError;
      setMember(memberData);

      // 2. Get studio details
      const { data: studioData, error: studioError } = await supabase
        .from("studios")
        .select("*")
        .eq("id", memberData.studio_id)
        .single();

      if (studioError) throw studioError;
      setStudio(studioData);
    } catch (error) {
      console.error("[STUDIO_PROVIDER_ERROR]", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <StudioContext.Provider
      value={{
        studio,
        member,
        role: member?.role || null,
        isOwner: member?.role === "owner",
        isLoading,
        refresh: fetchData,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
}

export const useCurrentStudio = () => useContext(StudioContext);
