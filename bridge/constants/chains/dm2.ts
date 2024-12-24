import { defineChain } from 'viem';
import { chainConfig } from 'viem/op-stack';

import { ChainId } from '../types';

export const Dm2Verse = defineChain({
  id: ChainId.DM2,
  name: 'DM2 Verse',
  nativeCurrency: { name: 'Oasys', symbol: 'OAS', decimals: 18 },
  rpcUrls: {
    'default': {
      http: [ 'https://rpc.dm2verse.dmm.com/' ],
    },
  },
  blockExplorers: {
    'default': {
      name: 'DM2 Verse scan',
      url: 'https://explorer.dm2verse.dmm.com/',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    l1StandardBridge: {
      [ChainId.OASYS]: {
        address: '0x0C13f0299DD6B51D547d27C547DA14077Ad4BfFE',
      },
    },
  },
});
