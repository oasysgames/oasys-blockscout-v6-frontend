import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/blocks', async (req, res) => {
  const blocks = await prisma.block.findMany({
    orderBy: { id: 'desc' },
    take: 20
  });
  res.json(blocks);
});

export default router; 