import { Grid } from '@chakra-ui/react';
import React from 'react';

import StatsWidget from 'ui/shared/stats/StatsWidget';
import useExperiment from './useExperiment';

const UNITS_WITHOUT_SPACE = [ 's' ];

const NumberWidgetsList = () => {
  const { verseStats, isLoading } = useExperiment();

  if (!verseStats) {
    return null;
  }

  const counters = verseStats.map(verse => [
    {
      id: `${verse.verseId}-deposit-amount`,
      value: verse.depositAmount.toString(),
      title: `${verse.chainName} Deposits`,
      units: 'OAS',
      description: 'Total amount of deposits',
    },
    {
      id: `${verse.verseId}-withdraw-amount`,
      value: verse.withdrawAmount.toString(),
      title: `${verse.chainName} Withdraws`,
      units: 'OAS',
      description: 'Total amount of withdraws',
    },
    {
      id: `${verse.verseId}-deposit-count`,
      value: verse.depositCount.toString(),
      title: `${verse.chainName} Deposit Count`,
      units: '',
      description: 'Number of deposit transactions',
    },
    {
      id: `${verse.verseId}-withdraw-count`,
      value: verse.withdrawCount.toString(),
      title: `${verse.chainName} Withdraw Count`,
      units: '',
      description: 'Number of withdraw transactions',
    },
  ]).flat();

  return (
    <Grid
      gridTemplateColumns={{ base: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
      gridGap={ 4 }
    >
      {
        counters.map(({ id, title, value, units, description }) => {
          let unitsStr = '';
          if (units && UNITS_WITHOUT_SPACE.includes(units)) {
            unitsStr = units;
          } else if (units) {
            unitsStr = ' ' + units;
          }

          return (
            <StatsWidget
              key={ id }
              label={ title }
              value={ `${ Number(value).toLocaleString(undefined, { maximumFractionDigits: 3, notation: 'compact' }) }${ unitsStr }` }
              isLoading={ isLoading }
              hint={ description }
            />
          );
        })
      }
    </Grid>
  );
};

export default NumberWidgetsList;
