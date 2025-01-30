import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const THEGRAPH_API_URL = process.env.NEXT_PUBLIC_THEGRAPH_API_URL || 'http://localhost:8000/subgraphs/name/oasys/bridge';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    console.warn('GraphQL invalid method', {
      method: req.method,
      url: req.url,
    });
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const startTime = Date.now();
  try {
    console.info('GraphQL request started', {
      url: THEGRAPH_API_URL,
      query: req.body.query,
      variables: req.body.variables,
    });

    const response = await fetch(THEGRAPH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    console.info('GraphQL request successful', {
      url: THEGRAPH_API_URL,
      duration,
      response: JSON.stringify(data),
    });

    res.status(response.status).json(data);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('GraphQL request error', {
      url: THEGRAPH_API_URL,
      duration,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    });
    res.status(500).json({ message: 'Internal server error' });
  }
}
