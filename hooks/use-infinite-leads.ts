"use client";

import { useState, useEffect, useCallback } from "react";

interface UseInfiniteLeadsOptions {
  limit?: number;
  status?: string;
  source?: string;
  search?: string;
}

/**
 * Hook for paginated lead fetching (infinite scroll style).
 */
export function useInfiniteLeads(options: UseInfiniteLeadsOptions = {}) {
  const [leads, setLeads] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { limit = 20, status, source, search } = options;

  const fetchLeads = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
        ...(status && { status }),
        ...(source && { source }),
        ...(search && { search }),
      });

      const res = await fetch(`/api/leads?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch leads");
      
      const { data, count } = await res.json();
      
      if (pageNum === 1) {
        setLeads(data);
      } else {
        setLeads(prev => [...prev, ...data]);
      }
      
      setHasMore(leads.length + data.length < count);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  }, [limit, status, source, search, leads.length]);

  // Initial fetch
  useEffect(() => {
    setPage(1);
    fetchLeads(1);
  }, [status, source, search, fetchLeads]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchLeads(nextPage);
    }
  }, [loading, hasMore, page, fetchLeads]);

  return {
    leads,
    loading,
    hasMore,
    loadMore,
  };
}
