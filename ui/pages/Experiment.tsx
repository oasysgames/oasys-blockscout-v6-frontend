import { Box } from '@chakra-ui/react';
import React from 'react';

import config from 'configs/app';
import PageTitle from 'ui/shared/Page/PageTitle';

import ChartsWidgetsList from '../experiment/ChartsWidgetsList';
import NumberWidgetsList from '../experiment/NumberWidgetsList';
import ExperimentFilters from '../experiment/ExperimentFilters';
import useExperiment from '../experiment/useExperiment';
import TotalDepositsBox from '../experiment/TotalDepositsBox';
import DepositHistoryChart from '../experiment/DepositHistoryChart';

const Experiment = () => {
  const {
    isPlaceholderData,
    isError,
    sections,
    currentSection,
    handleSectionChange,
    interval,
    handleIntervalChange,
    handleFilterChange,
    displayedCharts,
    filterQuery,
    initialFilterQuery,
  } = useExperiment();

  return (
    <>
      <PageTitle
        title={ config.meta.seo.enhancedDataEnabled ? `${ config.chain.name } statistic & data` : `${ config.chain.name } experiment` }
      />

      <Box mb={{ base: 6, sm: 8 }}>
        <NumberWidgetsList/>
      </Box>

      <Box mb={{ base: 6, sm: 8 }}>
        <TotalDepositsBox />
      </Box>

      <Box mb={{ base: 6, sm: 8 }}>
        <DepositHistoryChart />
      </Box>

      <Box mb={{ base: 6, sm: 8 }}>
        <ExperimentFilters
          isLoading={ isPlaceholderData }
          initialFilterValue={ initialFilterQuery }
          sections={ sections }
          currentSection={ currentSection }
          onSectionChange={ handleSectionChange }
          interval={ interval }
          onIntervalChange={ handleIntervalChange }
          onFilterInputChange={ handleFilterChange }
        />
      </Box>
    </>
  );
};

export default Experiment;
