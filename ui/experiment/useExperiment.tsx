import { useRouter } from 'next/router';
import React, { useCallback, useMemo, useState } from 'react';
import { GraphQLClient, gql } from 'graphql-request';

interface DailyBridgeStat {
  id: string;
  chainName: string;
  date: string;
  eventType: string;
  total_amount: string;
  count: string;
}

interface BridgeStatsResponse {
  dailyBridgeStats: DailyBridgeStat[];
}

// クライアントをコンポーネント内で初期化
const createClient = () => new GraphQLClient('http://localhost:8000/subgraphs/name/oasys/bridge', {
  headers: {
    'Content-Type': 'application/json',
  },
});

const DAILY_STATS_QUERY = gql`
  query GetDailyBridgeStats($first: Int!, $startDate: String!, $endDate: String!) {
    dailyBridgeStats(
      first: $first
      orderBy: date
      orderDirection: desc
      where: { 
        date_gte: $startDate,
        date_lte: $endDate
      }
    ) {
      id
      chainName
      date
      eventType
      total_amount
      count
    }
  }
`;

export default function useExperiment() {
  const [startDate, setStartDate] = useState('2022-11-01');
  const [endDate, setEndDate] = useState('2025-12-31');
  const [chainFilter, setChainFilter] = useState('all');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<DailyBridgeStat[]>([]);

  const fetchData = useCallback(async () => {
    const client = createClient();
    try {
      console.log('Fetching data with params:', { startDate, endDate });
      setIsLoading(true);

      const variables = {
        first: 1000,
        startDate,
        endDate,
      };
      console.log('GraphQL query:', DAILY_STATS_QUERY);
      console.log('Variables:', variables);

      const response = await client.request<BridgeStatsResponse>(DAILY_STATS_QUERY, variables);
      
      console.log('Raw API Response:', response);
      console.log('API Response:', JSON.stringify(response, null, 2));

      if (response?.dailyBridgeStats) {
        console.log('Setting data:', response.dailyBridgeStats.length, 'items');
        setData(response.dailyBridgeStats);
      } else {
        console.warn('Unexpected response structure:', response);
        setData([]);
      }
      setError(null);
    } catch (err) {
      console.error('API Error:', err);
      if (err instanceof Error) {
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
        });
      }
      setError(err as Error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  // コンポーネントマウント時に一度だけ実行
  React.useEffect(() => {
    console.log('Initial useEffect triggered');
    fetchData();
  }, []); // 依存配列を空にする

  // 日付変更時にデータを再取得
  React.useEffect(() => {
    console.log('Date change useEffect triggered');
    fetchData();
  }, [startDate, endDate, fetchData]);

  const filteredData = useMemo(() => {
    console.log('Filtering data:', { 
      dataLength: data.length, 
      chainFilter, 
      eventTypeFilter,
      rawData: data 
    });
    const filtered = data.filter(stat => {
      const chainMatches = chainFilter === 'all' || stat.chainName === chainFilter;
      const eventMatches = eventTypeFilter === 'all' || stat.eventType === eventTypeFilter;
      return chainMatches && eventMatches;
    });
    console.log('Filtered data length:', filtered.length);
    return filtered;
  }, [data, chainFilter, eventTypeFilter]);

  const uniqueChains = useMemo(() => {
    const chains = new Set(data.map(stat => stat.chainName));
    return ['all', ...Array.from(chains)];
  }, [data]);

  const uniqueEventTypes = useMemo(() => {
    const events = new Set(data.map(stat => stat.eventType));
    return ['all', ...Array.from(events)];
  }, [data]);

  const handleStartDateChange = useCallback((date: string) => {
    setStartDate(date);
  }, []);

  const handleEndDateChange = useCallback((date: string) => {
    setEndDate(date);
  }, []);

  const handleChainFilterChange = useCallback((chain: string) => {
    setChainFilter(chain);
  }, []);

  const handleEventTypeFilterChange = useCallback((eventType: string) => {
    setEventTypeFilter(eventType);
  }, []);

  return {
    data: filteredData,
    isLoading,
    error,
    startDate,
    endDate,
    chainFilter,
    eventTypeFilter,
    uniqueChains,
    uniqueEventTypes,
    handleStartDateChange,
    handleEndDateChange,
    handleChainFilterChange,
    handleEventTypeFilterChange,
  };
}
