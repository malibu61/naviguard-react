// API Configuration
export const API_BASE_URL = 'https://localhost:7279';

// API Endpoints
export const API_ENDPOINTS = {
  ANALYZE_ROUTE: '/api/AiAssistant/analyze-route',
  WATERZONE_DETECT: '/api/waterzone/detect',
  WEATHER_COORDINATES: '/api/weather/coordinates/combined',
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};
