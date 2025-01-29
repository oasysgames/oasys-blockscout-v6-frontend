import { Box, Select, Input, Grid, Text, VStack, HStack, Spinner, SimpleGrid } from '@chakra-ui/react';
import React from 'react';

import config from 'configs/app';
import PageTitle from 'ui/shared/Page/PageTitle';
import ChartWidget from 'ui/shared/chart/ChartWidget';
import useExperiment from '../experiment/useExperiment';

const Experiment = () => {
  const {
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
    totalAccumulatedByChain,
    chainChartData,
  } = useExperiment();

  return (
    <>
      <PageTitle
        title={ config.meta.seo.enhancedDataEnabled ? `${ config.chain.name } statistic & data` : `${ config.chain.name } experiment` }
      />

      {/* フィルターセクション */}
      <Box mb={6}>
        <HStack spacing={4}>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
          />
          <Select
            value={chainFilter}
            onChange={(e) => handleChainFilterChange(e.target.value)}
          >
            {uniqueChains.map(chain => (
              <option key={chain} value={chain}>{chain}</option>
            ))}
          </Select>
          <Select
            value={eventTypeFilter}
            onChange={(e) => handleEventTypeFilterChange(e.target.value)}
          >
            {uniqueEventTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>
        </HStack>
      </Box>

      {/* ローディング状態の表示 */}
      {isLoading && (
        <Box textAlign="center" my={4}>
          <Spinner />
        </Box>
      )}

      {/* エラーメッセージの表示 */}
      {error && (
        <Box bg="red.100" p={4} borderRadius="md" mb={4}>
          <Text color="red.600">{error.message}</Text>
        </Box>
      )}

      {/* チェーンごとの最新accumulated_amount */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        {totalAccumulatedByChain.map((stat) => (
          <Box
            key={stat.chainName}
            p={5}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
          >
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              {stat.chainName}
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="blue.500">
              {stat.accumulated_amount.toFixed(2)} ETH
            </Text>
            <Text fontSize="sm" color="gray.500">
              最終更新: {new Date(Number(stat.latestBlockTime) * 1000).toLocaleString()}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      {/* チェーンごとのaccumulated_amountチャート */}
      {chainChartData.map((chain) => (
        <Box key={chain.chainName} mb={6}>
          <ChartWidget
            title={`${chain.chainName}の累積残高推移`}
            description="日次の累積残高"
            items={chain.data.map(item => ({
              date: new Date(item.date),
              value: item.value,
            }))}
            isLoading={isLoading}
            isError={!!error}
            units="ETH"
          />
        </Box>
      ))}
    </>
  );
};

export default Experiment;
