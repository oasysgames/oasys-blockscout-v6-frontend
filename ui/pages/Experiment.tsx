import { Box, Select, Input, Grid, Text, VStack, HStack, Spinner } from '@chakra-ui/react';
import React from 'react';

import config from 'configs/app';
import PageTitle from 'ui/shared/Page/PageTitle';
import ChartsWidgetsList from '../experiment/ChartsWidgetsList';
import ExperimentFilters from '../experiment/ExperimentFilters';
import NumberWidgetsList from '../experiment/NumberWidgetsList';
import useExperiment from '../experiment/useExperiment';

const Experiment = () => {
  const {
    data,
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
    isPlaceholderData,
    isError,
    sections,
    currentSection,
    handleSectionChange,
    interval,
    handleIntervalChange,
    filterQuery,
    handleFilterChange,
    filteredSections,
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

      {/* Verse別の統計データ */}
      <Box mb={{ base: 6, sm: 8 }}>
        <NumberWidgetsList />
      </Box>

      {/* チャートセクション */}
      <Box mb={{ base: 6, sm: 8 }}>
        <ExperimentFilters
          isLoading={ isPlaceholderData }
          initialFilterValue=""
          sections={ sections }
          currentSection={ currentSection }
          onSectionChange={ handleSectionChange }
          interval={ interval }
          onIntervalChange={ handleIntervalChange }
          onFilterInputChange={ handleFilterChange }
        />
      </Box>

      <ChartsWidgetsList
        initialFilterQuery=""
        filterQuery={ filterQuery }
        isError={ isError }
        isPlaceholderData={ isPlaceholderData }
        interval={ interval }
        charts={ filteredSections }
      />
    </>
  );
};

export default Experiment;
