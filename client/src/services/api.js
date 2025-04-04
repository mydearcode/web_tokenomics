import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

console.log('API URL:', API_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor for logging and token management
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details
    console.log('Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
    });
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
      
      // Handle specific error cases
      if (error.response.status === 403) {
        console.error('Authorization error: Access forbidden');
        // Optionally redirect to login or show error message
      } else if (error.response.status === 401) {
        console.error('Authentication error: Unauthorized');
        // Optionally clear token and redirect to login
        localStorage.removeItem('token');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error:', error.request);
    } else {
      // Error in request configuration
      console.error('Request configuration error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Auth endpoints
export const register = async (name, email, password) => {
  try {
    console.log('Registering user:', { name, email });
    const response = await api.post('/auth/register', { name, email, password });
    console.log('Register response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    console.log('Logging in user:', { email });
    const response = await api.post('/auth/login', { email, password });
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateProfile = async (name, email) => {
  try {
    const response = await api.put('/auth/profile', { name, email });
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error.response?.data || error.message);
    throw error;
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.put('/auth/password', { currentPassword, newPassword });
    return response.data;
  } catch (error) {
    console.error('Change password error:', error.response?.data || error.message);
    throw error;
  }
};

// Project endpoints
export const createProject = async (projectData) => {
  try {
    console.log('Creating project:', projectData);
    const response = await api.post('/projects', projectData);
    console.log('Create project response:', response.data);
    
    // Log the structure of the response
    console.log('Response structure:', {
      hasData: 'data' in response.data,
      hasSuccess: 'success' in response.data,
      keys: Object.keys(response.data)
    });
    
    return response.data;
  } catch (error) {
    console.error('Create project error:', error.response?.data || error.message);
    throw error;
  }
};

export const getProjects = async () => {
  try {
    console.log('Fetching projects');
    const response = await api.get('/projects');
    console.log('Projects response:', response.data);
    
    // Log the structure of the response
    console.log('Response structure:', {
      hasData: 'data' in response.data,
      hasSuccess: 'success' in response.data,
      keys: Object.keys(response.data)
    });
    
    // Handle different response structures
    let projects = [];
    if (response.data?.data) {
      // If response has data.data structure
      projects = response.data.data;
    } else if (Array.isArray(response.data)) {
      // If response is directly an array
      projects = response.data;
    } else if (response.data?.projects) {
      // If response has data.projects structure
      projects = response.data.projects;
    }
    
    console.log('Extracted projects:', projects);
    
    return {
      data: projects,
      success: true
    };
  } catch (error) {
    console.error('Get projects error:', error.response?.data || error.message);
    // If the error is 404 (not found), return an empty array
    if (error.response?.status === 404) {
      return {
        data: [],
        success: true
      };
    }
    throw error;
  }
};

export const getProject = async (id) => {
  try {
    const response = await api.get(`/projects/${id}`);
    console.log('Project response:', response.data);
    
    // If response has data.data structure
    if (response.data?.data) {
      return response.data.data;
    }
    
    // If response is directly the project
    return response.data;
  } catch (error) {
    console.error('Get project error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateProject = async (id, projectData) => {
  try {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  } catch (error) {
    console.error('Update project error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteProject = async (id) => {
  try {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete project error:', error.response?.data || error.message);
    throw error;
  }
};

export default api; 