import { Box, Container, Heading, Icon, Button, Text, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import React from 'react';
import { FiZap, FiRefreshCw } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';

interface BridgeData {
  timestamp: string;
  amount: number;
}

const fetchBridgeStats = async (): Promise<BridgeData[]> => {
  const response = await fetch('/api/bridge-stats');
  if (!response.ok) {
    throw new Error('APIサーバーに接続できません。バックエンドサービスが起動しているか確認してください。');
  }
  const data = await response.json();
  return data as BridgeData[];
};

const ExperimentPage: React.FC = () => {
  const { data: bridgeData, refetch, isLoading, error } = useQuery({
    queryKey: ['bridge-stats'],
    queryFn: fetchBridgeStats
  });

  return (
    <Container maxW="container.xl" py={6}>
      <Box mb={6} display="flex" alignItems="center" gap={3}>
        <Icon as={FiZap} boxSize={6}/>
        <Heading as="h1" size="lg" flex="1">
          Bridge Statistics
        </Heading>
        <Button
          leftIcon={<FiRefreshCw />}
          onClick={() => refetch()}
          size="sm"
          isLoading={isLoading}
        >
          更新
        </Button>
      </Box>
      
      {isLoading && (
        <Box display="flex" alignItems="center" gap={3} justifyContent="center" py={8}>
          <Spinner />
          <Text>データを読み込み中...</Text>
        </Box>
      )}

      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error instanceof Error ? error.message : 'エラーが発生しました'}
        </Alert>
      )}
      
      {bridgeData && (
        <Box mt={6}>
          <LineChart width={800} height={400} data={bridgeData}>
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#8884d8" />
          </LineChart>
        </Box>
      )}
    </Container>
  );
};

export default ExperimentPage;
