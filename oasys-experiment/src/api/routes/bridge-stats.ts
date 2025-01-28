import express from 'express';
// import { PrismaClient } from '@prisma/client';

const router = express.Router();
// const prisma = new PrismaClient();

router.get('/bridge-stats', async (req, res) => {
  // const stats = await prisma
  console.log(req, res)
});

export default router;