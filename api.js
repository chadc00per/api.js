const baseURL = config.isLocal ? config.localUrl : config.remoteUrl;

async function get(endpoint) {
  try {
    console.log(`GET request to: ${baseURL}${endpoint}`);
    const response = await fetch(`${baseURL}${endpoint}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function post(endpoint, data) {
  try {
    console.log(`POST request to: ${baseURL}${endpoint} with data:`, data);
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function put(endpoint, data) {
  try {
    console.log(`PUT request to: ${baseURL}${endpoint} with data:`, data);
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function del(endpoint) {
  try {
    console.log(`DELETE request to: ${baseURL}${endpoint}`);
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function patch(endpoint, data) {
  try {
    console.log(`PATCH request to: ${baseURL}${endpoint} with data:`, data);
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

window.api = { get, post, put, del, patch };