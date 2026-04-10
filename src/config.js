const BASE_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'https://bank-app-aoc8.onrender.com';

export const API_BASE = BASE_URL;
export const API_URL  = `${BASE_URL}/api`;
