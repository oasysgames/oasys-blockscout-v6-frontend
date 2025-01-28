import { Box } from '@chakra-ui/react';
import React from 'react';

import config from 'configs/app';
import PageTitle from 'ui/shared/Page/PageTitle';

// import ChartsWidgetsList from '../experiment/ChartsWidgetsList';
import ExperimentFilters from '../experiment/ExperimentFilters';
import NumberWidgetsList from '../experiment/NumberWidgetsList';
import useExperiment from '../experiment/useExperiment';

const Experiment = () => {
  const {
    isPlaceholderData,
    // isError,
    sections,
    currentSection,
    handleSectionChange,
    interval,
    handleIntervalChange,
    handleFilterChange,
    // displayedCharts,
    // filterQuery,
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
