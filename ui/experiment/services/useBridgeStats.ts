import { useState, useEffect } from 'react';
import { GraphQLClient } from 'graphql-request';
import type { DailyBridgeStat, BridgeStatsResponse } from './types';
import { DAILY_STATS_QUERY } from './types';

const createClient = () => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${ baseUrl }/api/experiment/experiment-graphql`;
  return new GraphQLClient(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

interface UseBridgeStatsParams {
  startDate: string;
  endDate: string;
  chainFilter: string;
  eventTypeFilter: string;
}

interface UseBridgeStatsResult {
  data: DailyBridgeStat[];
  isLoading: boolean;
  error: Error | null;
}

export const useBridgeStats = ({
  startDate,
  endDate,
  chainFilter,
  eventTypeFilter,
}: UseBridgeStatsParams): UseBridgeStatsResult => {
  const [ data, setData ] = useState<DailyBridgeStat[]>([]);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ error, setError ] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async() => {
      try {
        setIsLoading(true);
        const client = createClient();
        const response = await client.request<BridgeStatsResponse>(DAILY_STATS_QUERY, {
          first: 1000,
          orderBy: 'date',
          orderDirection: 'desc',
          startDate,
          endDate,
        });

        let filteredData = response.dailyBridgeStats;

        if (chainFilter !== 'all') {
          filteredData = filteredData.filter(item => item.chainName === chainFilter);
        }

        if (eventTypeFilter !== 'all') {
          filteredData = filteredData.filter(item => item.eventType === eventTypeFilter);
        }

        setData(filteredData);
        setError(null);
      } catch (err) {
        console.error('GraphQL request failed:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [ startDate, endDate, chainFilter, eventTypeFilter ]);

  return { data, isLoading, error };
}; 