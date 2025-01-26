import { Grid } from '@chakra-ui/react';
import React from 'react';

import useApiQuery from 'lib/api/useApiQuery';
import { STATS_COUNTER } from 'stubs/stats';
import StatsWidget from 'ui/shared/stats/StatsWidget';

import DataFetchAlert from '../shared/DataFetchAlert';

const MOCK_DATA = {
  counters: [
    {
      id: 'averageBlockTime',
      value: '12.063417307959384',
      title: 'Bridge Token 1',
      units: 's',
      description: 'Average time taken in seconds for a block to be included in the blockchain',
    },
    {
      id: 'completedTxns',
      value: '15057958',
      title: 'Bridge Token 2',
      units: 'a',
      description: 'Number of transactions with success status',
    },
    {
      id: 'lastNewContracts',
      value: '5',
      title: 'Bridge Token 3',
      units: '',
      description: 'Number of deployed contracts today',
    },
    {
      id: 'lastNewVerifiedContracts',
      value: '0',
      title: 'Bridge Token 4',
      units: '',
      description: 'Number of contracts verified today',
    },
    {
      id: 'totalAccounts',
      value: '54194',
      title: 'Bridge Token 5',
      units: '',
      description: 'Number of EOAs that sent at least 1 transaction',
    },
    {
      id: 'totalAddresses',
      value: '76753',
      title: 'Bridge Token 6',
      units: '',
      description: 'Number of addresses that participated in the blockchain',
    },
    {
      id: 'totalBlocks',
      value: '6091604',
      title: 'Bridge Token 7',
      units: '',
      description: 'Number of blocks over all time',
    },
    {
      id: 'totalContracts',
      value: '3790',
      title: 'Bridge Token 8',
      units: '',
      description: 'Number of contracts',
    },
    {
      id: 'totalNativeCoinTransfers',
      value: '359540',
      title: 'Bridge Token 9 transfers',
      units: '',
      description: 'Number of transactions with the transfer of the OAS',
    },
    {
      id: 'totalTokens',
      value: '186',
      title: 'Bridge Token 10 transfers',
      units: '',
      description: 'Number of all token contracts',
    },
    {
      id: 'totalTxns',
      value: '15579695',
      title: 'Bridge Token 11 transfers',
      units: '',
      description: 'All transactions including pending, dropped, replaced, failed transactions',
    },
    {
      id: 'totalVerifiedContracts',
      value: '479',
      title: 'Bridge Token 12 transfers',
      units: '',
      description: 'Number of verified contracts',
    },
  ],
};

const UNITS_WITHOUT_SPACE = [ 's' ];

const NumberWidgetsList = () => {
  // const { data, isPlaceholderData, isError } = useApiQuery('stats_counters', {
  //   queryOptions: {
  //     placeholderData: { counters: MOCK_DATA.counters },
  //   },
  // });
  // const { data, isPlaceholderData, isError } = useApiQuery('stats_counters', {
  //   queryOptions: {
  //     placeholderData: { counters: Array(10).fill(STATS_COUNTER) },
  //   },
  // });

  const data = MOCK_DATA;
  const isPlaceholderData = false;

  if (!data) {
    return <DataFetchAlert/>;
  }

  return (
    <Grid
      gridTemplateColumns={{ base: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
      gridGap={ 4 }
    >
      {
        data?.counters?.map(({ id, title, value, units, description }, index) => {

          let unitsStr = '';
          if (units && UNITS_WITHOUT_SPACE.includes(units)) {
            unitsStr = units;
          } else if (units) {
            unitsStr = ' ' + units;
          }

          return (
            <StatsWidget
              key={ id + (isPlaceholderData ? index : '') }
              label={ title }
              value={ `${ Number(value).toLocaleString(undefined, { maximumFractionDigits: 3, notation: 'compact' }) }${ unitsStr }` }
              isLoading={ isPlaceholderData }
              hint={ description }
            />
          );
        })
      }
    </Grid>
  );
};

export default NumberWidgetsList;
