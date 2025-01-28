import { Box, Flex, Text, Skeleton, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import useSWR from 'swr';

interface ChainDeposit {
  id: string;
  name: string;
  totalDeposits: string;
}

interface TotalDepositsResponse {
  chains: ChainDeposit[];
}

const TotalDepositsBox = () => {
  const { data, error, isLoading } = useSWR<TotalDepositsResponse>('/api/bridge-deposits/total-deposits');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (error) {
    return (
      <Box p={4} borderRadius="lg" border="1px" borderColor={borderColor}>
        <Text>データの取得に失敗しました</Text>
      </Box>
    );
  }

  return (
    <Box p={4} borderRadius="lg" border="1px" borderColor={borderColor}>
      <Text fontSize="lg" fontWeight="bold" mb={4}>チェーンごとの総デポジット</Text>
      <Flex direction="column" gap={4}>
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} height="60px" />
          ))
        ) : (
          data?.chains.map((chain) => (
            <Box
              key={chain.id}
              p={4}
              borderRadius="md"
              bg={useColorModeValue('gray.50', 'gray.700')}
            >
              <Flex justify="space-between" align="center">
                <Text fontWeight="medium">{chain.name}</Text>
                <Text fontSize="xl" fontWeight="bold">
                  {parseFloat(chain.totalDeposits).toLocaleString()} ETH
                </Text>
              </Flex>
            </Box>
          ))
        )}
      </Flex>
    </Box>
  );
};

export default TotalDepositsBox; 