import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const THEGRAPH_API_URL = process.env.NEXT_PUBLIC_THEGRAPH_API_URL || 'http://localhost:8000/subgraphs/name/oasys/bridge';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const response = await fetch(THEGRAPH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    // console.error('GraphQL proxy error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
