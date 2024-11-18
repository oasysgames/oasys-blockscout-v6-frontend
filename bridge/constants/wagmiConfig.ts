import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { http } from 'viem';
import { createStorage, noopStorage } from 'wagmi';

import type { ChainId } from './types';

import { getChainInfo, Oasys } from './chains';

// Get l2Chain from .env
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const l2ChainId = Number(process.env.NEXT_PUBLIC_L2_CHAIN_ID) as ChainId;
const l2Chain = getChainInfo(l2ChainId);

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '';

export const wagmiConfig = defaultWagmiConfig({
  chains: [ Oasys, l2Chain ],
  transports: {
    [Oasys.id]: http(),
    [l2Chain.id]: http(),
  },
  projectId: walletConnectProjectId,
  metadata: {
    name: `oasys bridge`,
    description: `oasys bridge`,
    url: appUrl,
    icons: [],
  },
  // enableEmail: true,
  ssr: true,
  batch: { multicall: { wait: 100 } },
  storage: createStorage({
    storage:
			typeof window !== 'undefined' && window.localStorage ?
			  window.localStorage :
			  noopStorage,
  }),
});
