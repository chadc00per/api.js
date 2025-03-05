const API_BASE = 'http://localhost'
let authToken;
let API_KEY;
  
async function callApi(endpoint, method = 'GET', body = null, auth = true) {
    try {
        console.log(`[${method}] ${endpoint} called with body:`, body);
        const isFormData = body instanceof FormData;

        if (method === 'GET' && body) {
            endpoint = Object.keys(body).length ? `${endpoint}?${serializeQueryParams(body)}` : endpoint;
        }
        const headers = getAuthHeaders();
        if (auth && (!headers || (!headers.Authorization && !headers['x-api-key']))) {
            console.error('Missing required authorization');
            return null;
        }
        const response = await fetch(`${API_BASE}/${endpoint}`, {
            method,
            headers: {
                ...(auth ? headers : {}),
                ...(isFormData ? {} : { 'Content-Type': 'application/json' })
            },
            credentials: 'include',
            ...(method !== 'GET' && body && {body: isFormData ? body : JSON.stringify(body)})
        });

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            // Get response text if JSON parsing fails
            data = await response.text().catch(() => '');
        }
        if (response.ok) {
            console.table(`[${method}] ${endpoint} returned:`, data);
            return data;
        } else {
            throw data;
        }
    } catch (error) {
        console.error(`[${method}] ${endpoint} returned error:`, error.message);
        handleApiError(error);
        throw error;
    }
}

function getAuthHeaders() {
    try {
      const headers = {};
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      } else if (API_KEY) {
        headers['x-api-key'] = API_KEY;
      } else {
        console.error('No auth token or api key provided');
        return {};
      }
      console.debug('Authorizations extracted:', headers);
      return headers;
    } catch (error) {
      console.error('Error retreiving saved authorization:', error.message);
      return {};
    }
}

function serializeQueryParams(params) {
  try {
    console.debug('Serializing query params:', params);
    if (!params) return '';
    return Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
  } catch (error) {
    console.error('Error serializing query params:', error);
    throw error;
  }
}

async function callRefreshToken() {
    try {
        console.log('Refreshing token');

        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token provided');

        // Call refresh endpoint to get new auth token
        const data = await callApi('refresh', 'POST');

        if (!data || !data.data?.accessToken) {
            throw new Error('Failed to refresh token');
        }
        
        if (data.data && data.data?.accessToken) {
            setAuthToken(data.data.accessToken);
            return true;
        }
    } catch (error) {
        console.error('Error refreshing token:', error.message);
        authToken = null;
        refreshToken = null;
        document.cookie = 'refreshToken=; path=/; secure; samesite=strict';
        window.location.href = '/';
        return false;
    }
}

function setAuthToken(token) {
    try {
        if (!token) throw new Error('Auth token cannot be set');
        authToken = token;
        console.debug('authorization token set');
        return true;
    } catch (error) {
        console.error('Error setting auth token:', error.message);
        return false;
    }
}

function setRefreshToken(token) {
    try {
        if (!token) throw new Error('Refresh token cannot be set');
        document.cookie = `refreshToken=${token}; path=/; secure; samesite=strict`;
        console.debug('refresh token set');
        return true;
    } catch (error) {
        console.error('Error setting refresh token:', error.message);
        return false;
    }
}

function getRefreshToken() {
    try {
      const refreshToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('refreshToken='))?.split('=')[1] || null;
      return refreshToken;
    } catch (error) {
      console.error('Error getting refresh token:', error.message);
      return null;
    }
}
  
async function handleApiError(error) {
    try {
        let errorMessage;
        if (typeof error === 'string') {
            errorMessage = error;
        } else if (error?.message) {
            errorMessage = error.message;
        } else if (error?.toString) {
            errorMessage = error.toString();
        } else {
            errorMessage = 'An unknown error occurred';
        }

        // if 401 but user has a refresh token, try to refresh it
        const savedRefreshToken = getRefreshToken();
        if (error.statusCode === 401 && savedRefreshToken) {
            try {
                await callRefreshToken();
            } catch (refreshError) {
                console.error('Error refreshing token:', refreshError.message);
                errorMessage = 'Failed to refresh token';
            }
        }
        // if 401 but user has no refresh token, logout
        const savedAuthToken = authToken;
        if (error.statusCode === 401 && !savedRefreshToken && !savedAuthToken) {
            errorMessage = 'Failed to refresh token, logging out...';
            logout();
        }
        return null;
    } catch (err) {
        console.error('Error handling API error:', err);
        return null;
    }
}
