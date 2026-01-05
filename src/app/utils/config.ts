// utils/config.ts
export const getApiUrl = () => {
  // Check if we're in development mode and backend is down
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://3.225.161.94:3000/api';
};

export const RECOMMENDER_API = `${getApiUrl()}/recommender`;