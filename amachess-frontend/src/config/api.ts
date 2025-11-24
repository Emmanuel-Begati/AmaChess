// API Configuration
// This ensures all API calls use the correct base URL

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // If API_BASE_URL is relative, return relative path
  if (API_BASE_URL.startsWith('/')) {
    return `${API_BASE_URL}/${cleanEndpoint}`;
  }
  
  // Otherwise return full URL
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export default API_BASE_URL;
