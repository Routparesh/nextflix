import { NextApiRequest, NextApiResponse } from 'next';
import { Media, MediaType } from '../../types';
import { parse } from '../../utils/apiResolvers';
import getInstance from '../../utils/axios';

interface ApiResponse {
  type: 'Success' | 'Error';
  data: Media[] | string; // Use string for error messages
}

const apiKey = process.env.TMDB_KEY;

export default async function handler(request: NextApiRequest, response: NextApiResponse<ApiResponse>) {
  if (!apiKey) {
    return response.status(500).json({ type: 'Error', data: 'TMDB API key not configured' });
  }

  const axios = getInstance();
  const { type, genre } = request.query;

  try {
    const result = await axios.get(`/discover/${type}`, {
      params: {
        api_key: apiKey,
        with_genres: genre,
        watch_region: 'US',
        with_networks: '213'
      }
    });

    const data = parse(result.data.results, type as MediaType);
    return response.status(200).json({ type: 'Success', data });
  } catch (err: any) {
    console.error('TMDB API error:', err?.response?.data || err.message);

    return response.status(500).json({
      type: 'Error',
      data: err?.response?.data || 'An unexpected error occurred'
    });
  }
}
