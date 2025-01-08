import { Box, Container, Heading, Icon } from '@chakra-ui/react';
import React from 'react';
import { FiZap } from 'react-icons/fi'; // 実験を表す稲妻アイコンに変更

const ExperimentPage: React.FC = () => {
  return (
    <Container maxW="container.xl" py={ 6 }>
      <Box mb={ 6 } display="flex" alignItems="center" gap={ 3 }>
        <Icon as={ FiZap } boxSize={ 6 }/>
        <Heading as="h1" size="lg">
          Experiment
        </Heading>
      </Box>
      { /* ここに実験的な機能を実装 */ }
    </Container>
  );
};

export default ExperimentPage;
