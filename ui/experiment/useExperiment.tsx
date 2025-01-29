import React, { useCallback, useMemo, useState } from 'react';
import { GraphQLClient, gql } from 'graphql-request';

import type { LineChartInfo, LineChartSection } from '@blockscout/stats-types';
import type { StatsIntervalIds } from 'types/client/stats';

import { getChartsInfo } from './api/getChartsInfo';
import { useApiData } from './useApiData';

interface DailyBridgeStat {
  id: string;
  verseId: string;
  chainName: string;
  date: string;
  eventType: string;
  total_amount: string;
  accumulated_amount: string;
  count: string;
  blockTime: string;
}

interface BridgeStatsResponse {
  dailyBridgeStats: DailyBridgeStat[];
}

interface VerseStats {
  verseId: string;
  chainName: string;
  depositAmount: number;
  withdrawAmount: number;
  depositCount: number;
  withdrawCount: number;
  latestBlockTime: string;
}

function isSectionMatches(section: LineChartSection, currentSection: string): boolean {
  return currentSection === 'all' || section.id === currentSection;
}

function isChartNameMatches(q: string, chart: LineChartInfo) {
  return chart.title.toLowerCase().includes(q.toLowerCase());
}

// Wei単位をETHへ変換
function formatAmount(weiString: string): number {
  const weiNum = Number(weiString);
  if (Number.isNaN(weiNum)) return 0;
  return weiNum / 1e18;
}

const createClient = () => new GraphQLClient('http://localhost:8000/subgraphs/name/oasys/bridge', {
  headers: {
    'Content-Type': 'application/json',
  },
});

const DAILY_STATS_QUERY = gql`
  query GetDailyBridgeStats(
    $first: Int!,
    $orderBy: DailyBridgeStat_orderBy!,
    $orderDirection: OrderDirection!,
    $startDate: String!,
    $endDate: String!
  ) {
    dailyBridgeStats(
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { 
        date_gte: $startDate,
        date_lte: $endDate
      }
    ) {
      id
      verseId
      chainName
      date
      eventType
      total_amount
      accumulated_amount
      count
      blockTime
    }
  }
`;

export default function useExperiment() {
  // Charts info
  const { data: chartsData, isPlaceholderData, isError } = useApiData(getChartsInfo, [], { sections: [] });

  // State
  const [ currentSection, setCurrentSection ] = useState('all');
  const [ filterQuery, setFilterQuery ] = useState('');
  const [ interval, setInterval ] = useState<StatsIntervalIds>('oneMonth');
  const [ startDate, setStartDate ] = useState('2025-01-01');
  const [ endDate, setEndDate ] = useState('2025-01-31');
  const [ chainFilter, setChainFilter ] = useState('all');
  const [ eventTypeFilter, setEventTypeFilter ] = useState('all');
  const [ data, setData ] = useState<DailyBridgeStat[]>([]);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ error, setError ] = useState<Error | null>(null);

  // Computed values
  const sectionIds = useMemo(() => chartsData?.sections?.map(({ id }) => id), [ chartsData ]);

  const uniqueChains = useMemo(() => {
    const chains = new Set(['all', ...(data?.map(item => item.chainName) || [])]);
    return Array.from(chains);
  }, [data]);

  const uniqueEventTypes = useMemo(() => {
    const types = new Set(['all', ...(data?.map(item => item.eventType) || [])]);
    return Array.from(types);
  }, [data]);

  // Verse別の統計データを計算
  const verseStats = useMemo(() => {
    if (!data) return [];

    const verseMap = new Map<string, VerseStats>();

    data.forEach(item => {
      const key = item.verseId;
      const current = verseMap.get(key) || {
        verseId: item.verseId,
        chainName: item.chainName,
        depositAmount: 0,
        withdrawAmount: 0,
        depositCount: 0,
        withdrawCount: 0,
        latestBlockTime: item.blockTime,
      };

      if (item.eventType === 'DEPOSIT') {
        current.depositAmount += formatAmount(item.total_amount);
        current.depositCount += Number(item.count);
      } else if (item.eventType === 'WITHDRAW') {
        current.withdrawAmount += formatAmount(item.total_amount);
        current.withdrawCount += Number(item.count);
      }

      if (Number(item.blockTime) > Number(current.latestBlockTime)) {
        current.latestBlockTime = item.blockTime;
      }

      verseMap.set(key, current);
    });

    return Array.from(verseMap.values());
  }, [data]);

  // Filtered sections
  const filteredSections: Array<LineChartSection> = React.useMemo(() => {
    return chartsData?.sections
      ?.map((section) => {
        const charts = section.charts.filter((chart) => isSectionMatches(section, currentSection) && isChartNameMatches(filterQuery, chart));

        return {
          ...section,
          charts,
        };
      }).filter((section) => section.charts.length > 0) || [];
  }, [ currentSection, chartsData?.sections, filterQuery ]);

  // Event handlers
  const handleSectionChange = useCallback((newSection: string) => {
    setCurrentSection(newSection);
  }, []);

  const handleIntervalChange = useCallback((newInterval: StatsIntervalIds) => {
    setInterval(newInterval);
  }, []);

  const handleFilterChange = useCallback((q: string) => {
    setFilterQuery(q);
  }, []);

  const handleStartDateChange = useCallback((date: string) => {
    setStartDate(date);
  }, []);

  const handleEndDateChange = useCallback((date: string) => {
    setEndDate(date);
  }, []);

  const handleChainFilterChange = useCallback((chain: string) => {
    setChainFilter(chain);
  }, []);

  const handleEventTypeFilterChange = useCallback((type: string) => {
    setEventTypeFilter(type);
  }, []);

  // GraphQLデータの取得
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const client = createClient();
        const response = await client.request<BridgeStatsResponse>(DAILY_STATS_QUERY, {
          first: 1000,
          orderBy: "date",
          orderDirection: "desc",
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
  }, [startDate, endDate, chainFilter, eventTypeFilter]);

  return React.useMemo(() => ({
    sections: chartsData?.sections,
    sectionIds,
    isPlaceholderData,
    isError,
    filterQuery,
    currentSection,
    handleSectionChange,
    interval,
    handleIntervalChange,
    handleFilterChange,
    filteredSections,
    // GraphQLデータ関連
    data,
    isLoading,
    error,
    startDate,
    endDate,
    chainFilter,
    eventTypeFilter,
    uniqueChains,
    uniqueEventTypes,
    verseStats,
    handleStartDateChange,
    handleEndDateChange,
    handleChainFilterChange,
    handleEventTypeFilterChange,
  }), [
    chartsData,
    sectionIds,
    isPlaceholderData,
    isError,
    filterQuery,
    currentSection,
    handleSectionChange,
    interval,
    handleIntervalChange,
    handleFilterChange,
    filteredSections,
    data,
    isLoading,
    error,
    startDate,
    endDate,
    chainFilter,
    eventTypeFilter,
    uniqueChains,
    uniqueEventTypes,
    verseStats,
    handleStartDateChange,
    handleEndDateChange,
    handleChainFilterChange,
    handleEventTypeFilterChange,
  ]);
}
