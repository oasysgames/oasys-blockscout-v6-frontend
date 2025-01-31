import { NextResponse } from 'next/server';
import type { GraphQLRequestBody } from './types';

import { getFeaturePayload } from 'configs/app/features/types';
import config from 'configs/app';

interface GraphQLResponse {
  data?: unknown;
  errors?: Array<{ message: string }>;
}

const experimentFeature = getFeaturePayload(config.features.experiment);
const THEGRAPH_API_URL = experimentFeature?.api?.endpoint || 'http://localhost:8000/subgraphs/name/oasys/bridge';

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const body = await request.json() as GraphQLRequestBody;
    console.info('GraphQL request started', {
      url: THEGRAPH_API_URL,
      query: body.query,
      variables: body.variables,
    });

    const response = await fetch(THEGRAPH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed with status ${ response.status }`);
    }

    const data = await response.json() as GraphQLResponse;
    const duration = Date.now() - startTime;

    if (data.errors) {
      console.error('GraphQL response contains errors:', data.errors);
      throw new Error(data.errors[0]?.message || 'GraphQL query failed');
    }

    console.info('GraphQL request successful', {
      url: THEGRAPH_API_URL,
      duration,
      response: JSON.stringify(data),
    });

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
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
    return NextResponse.json({
      errors: [ { message: error instanceof Error ? error.message : 'Internal server error' } ],
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
