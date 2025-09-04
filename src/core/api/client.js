// Simple direct API client - no axios complications
export const request = async (endpoint, options = {}) => {
  // Construct the correct URL
  const baseUrl = 'https://www.karrathub.com/api/ecosystem';
  const fullUrl = `${baseUrl}${endpoint}`;
  
  console.log('Making request to:', fullUrl);
  
  try {
    const apiKey = localStorage.getItem('karrat_api_key');
    const headers = {
      'Content-Type': 'application/json',
      ...(apiKey && { 'x-api-key': apiKey }),
      ...options.headers
    };

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response success:', response.status, fullUrl);
    return data;
    
  } catch (error) {
    console.error('API Error:', error.message, fullUrl);
    throw new Error(`Failed to fetch from ${endpoint}: ${error.message}`);
  }
};