// api/client.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Important: enables cookies for refresh tokens
});
