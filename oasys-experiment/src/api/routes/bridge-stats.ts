import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/bridge-stats', async (req, res) => {
  const stats = await prisma.bridgeTransaction.findMany({
    where: {
      fromChain: 'L1',
      toChain: 'L2',
      token: 'OAS'
    },
    orderBy: { timestamp: 'asc' }
  });

  res.json(stats);
});

export default router; 