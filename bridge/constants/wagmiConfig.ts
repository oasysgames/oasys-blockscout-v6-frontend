import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { http } from 'viem';
import { createStorage, noopStorage } from 'wagmi';

import { ChainId } from './types';

import { getChainInfo, Oasys } from './chains';
import config from 'configs/app';

// Get l2Chain from .env
const appUrl = config.verse.bridge.appUrl;
const l2ChainId = Number(config.verse.bridge.l2ChainId) as ChainId;
const l2Chain = getChainInfo(l2ChainId);

const walletConnectProjectId = config.verse.bridge.connectProjectId;

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
