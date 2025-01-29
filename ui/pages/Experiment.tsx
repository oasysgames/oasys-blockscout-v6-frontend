import { Box, Select, Input, Grid, Text, VStack } from '@chakra-ui/react';
import React from 'react';

import config from 'configs/app';
import PageTitle from 'ui/shared/Page/PageTitle';
import useExperiment from '../experiment/useExperiment';
import TotalDepositsBox from '../experiment/TotalDepositsBox';
import DepositHistoryChart from '../experiment/DepositHistoryChart';

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
  } = useExperiment();

  return (
    <>
      <PageTitle
        title={ `${ config.chain.name } Bridge Statistics` }
      />

      <Box mb={{ base: 6, sm: 8 }}>
        <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
          <VStack align="start">
            <Text>Start Date</Text>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
            />
          </VStack>
          <VStack align="start">
            <Text>End Date</Text>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
            />
          </VStack>
          <VStack align="start">
            <Text>Chain</Text>
            <Select
              value={chainFilter}
              onChange={(e) => handleChainFilterChange(e.target.value)}
            >
              {uniqueChains.map(chain => (
                <option key={chain} value={chain}>{chain}</option>
              ))}
            </Select>
          </VStack>
          <VStack align="start">
            <Text>Event Type</Text>
            <Select
              value={eventTypeFilter}
              onChange={(e) => handleEventTypeFilterChange(e.target.value)}
            >
              {uniqueEventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
          </VStack>
        </Grid>
      </Box>

      <Box mb={{ base: 6, sm: 8 }}>
        <TotalDepositsBox data={data} isLoading={isLoading} error={error} />
      </Box>

      <Box mb={{ base: 6, sm: 8 }}>
        <DepositHistoryChart data={data} isLoading={isLoading} error={error} />
      </Box>
    </>
  );
};

export default Experiment;
