const API_BASE_URL = "http://localhost:8000/api";

export const api = {
  // Helper for GET requests
  get: async (endpoint, token = null) => {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers,
    });
    return handleResponse(response);
  },

  // Helper for POST requests
  post: async (endpoint, data, token = null) => {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Helper for PUT requests
  put: async (endpoint, data, token = null) => {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// Common error handler
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "API Request Failed");
  }
  return response.json();
}
