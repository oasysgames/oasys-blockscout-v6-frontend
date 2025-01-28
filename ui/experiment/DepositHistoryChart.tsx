import React from 'react';
import useSWR from 'swr';
import { useColorModeValue } from '@chakra-ui/react';

import ChartWidget from 'ui/shared/chart/ChartWidget';
import type { TimeChartItem } from 'ui/shared/chart/types';

interface DepositStat {
  id: string;
  chainId: string;
  timestamp: string;
  dailyDeposits: string;
}

interface DepositHistoryResponse {
  depositStats: DepositStat[];
}

const DepositHistoryChart = () => {
  const { data, error, isLoading } = useSWR<DepositHistoryResponse>('/api/bridge-deposits/deposit-history');

  const chartData: Array<TimeChartItem> = React.useMemo(() => {
    if (!data) return [];

    return data.depositStats.map((stat) => ({
      date: new Date(parseInt(stat.timestamp) * 1000),
      value: parseFloat(stat.dailyDeposits),
      chainId: stat.chainId,
    }));
  }, [data]);

  return (
    <ChartWidget
      title="デポジット推移"
      description="チェーンごとの日次デポジット量"
      items={chartData}
      isLoading={isLoading}
      isError={!!error}
      units="ETH"
    />
  );
};

export default DepositHistoryChart; 