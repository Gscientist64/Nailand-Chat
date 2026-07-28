import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { communitiesApi } from './api';
import type { Community } from '../../shared/types';

interface CommunitiesContextValue {
  communities: Community[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  joinCommunity: (id: string) => Promise<string | null>;
  getCommunity: (id: string) => Community | undefined;
}

const CommunitiesContext = createContext<CommunitiesContextValue | null>(null);

export function CommunitiesProvider({ children }: { children: React.ReactNode }) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const res = await communitiesApi.list();
    if (res.success && res.data) {
      setCommunities(
        res.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          avatar: c.avatar,
          memberCount: c.memberCount || 0,
          tags: c.tags || [],
          createdAt: c.createdAt,
        }))
      );
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const joinCommunity = useCallback(async (id: string): Promise<string | null> => {
    const res = await communitiesApi.join(id);
    if (res.success) {
      await refresh();
      return null;
    }
    return res.error || 'Failed to join community';
  }, [refresh]);

  const getCommunity = useCallback((id: string): Community | undefined => {
    return communities.find((c) => c.id === id);
  }, [communities]);

  return (
    <CommunitiesContext.Provider value={{ communities, isLoading, refresh, joinCommunity, getCommunity }}>
      {children}
    </CommunitiesContext.Provider>
  );
}

export function useCommunities(): CommunitiesContextValue {
  const ctx = useContext(CommunitiesContext);
  if (!ctx) throw new Error('useCommunities must be used within a CommunitiesProvider');
  return ctx;
}
