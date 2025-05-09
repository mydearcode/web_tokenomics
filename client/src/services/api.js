import axios from 'axios';

// API URL configuration for development and production
const API_URL = process.env.REACT_APP_API_URL || 'https://tokenomics-api-ghc0.onrender.com';

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

// Add request interceptor for token management
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;
      
      // Handle authentication errors
      if (status === 401) {
        // Clear token and user data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login page
        window.location.href = '/login';
      }
      
      // Create error message
      let message = data.message || 'An error occurred';
      if (data.details) {
        message = `${message}: ${data.details}`;
      }
      
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Request made but no response
      return Promise.reject(new Error('No response from server. Please check your internet connection.'));
    } else {
      // Request setup error
      return Promise.reject(new Error('Error setting up request. Please try again.'));
    }
  }
);

// Auth endpoints
export const register = async (userData) => {
  try {
    console.log('Registering user:', { userData });
    const response = await api.post('/api/auth/register', {
      name: userData.name,
      email: userData.email,
      password: userData.password
    });
    console.log('Register response:', response.data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const login = async (email, password) => {
  try {
    console.log('Logging in user:', { email });
    
    // Clear any existing token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    
    // Make the request directly with axios
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: email.trim(),
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Login response:', response.data);

    if (response.data.token) {
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      return response.data;
    } else {
      throw new Error('No token received from server');
    }
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message === 'No token received from server') {
      throw new Error('Kimlik doğrulama başarısız');
    } else if (error.response?.status === 401) {
      throw new Error('Geçersiz e-posta veya şifre');
    } else {
      throw new Error('Giriş başarısız oldu');
    }
  }
};

export const updateProfile = async (userData) => {
  try {
    const response = await api.put('/api/auth/profile', userData);
    console.log('Update profile response:', response.data);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error.response?.data || error.message);
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/api/auth/password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Change password error:', error.response?.data || error.message);
    throw error;
  }
};

// Project endpoints
export const createProject = async (projectData) => {
  try {
    const response = await api.post('/api/projects', projectData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to create project');
    } else {
      throw new Error('Network error while creating project');
    }
  }
};

export const getProjects = async () => {
  try {
    console.log('Fetching projects...');
    const response = await api.get('/api/projects');
    console.log('Projects response:', response);
    
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
    console.log('Making API call to get project:', id);
    const response = await api.get(`/api/projects/${id}`);
    console.log('API response:', response);
    return response.data;
  } catch (error) {
    console.error('API error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          throw new Error('Authentication required');
        case 403:
          throw new Error('You do not have permission to view this project');
        case 404:
          throw new Error('Project not found');
        default:
          throw new Error(error.response.data?.message || 'Failed to fetch project');
      }
    } else if (error.request) {
      throw new Error('Server is not responding. Please check your internet connection');
    } else {
      throw new Error('An error occurred while fetching the project');
    }
  }
};

export const updateProject = async (id, projectData) => {
  try {
    const response = await api.put(`/api/projects/${id}`, projectData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to update project');
    } else {
      throw new Error('Network error while updating project');
    }
  }
};

export const deleteProject = async (id) => {
  try {
    const response = await api.delete(`/api/projects/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to delete project');
    } else {
      throw new Error('Network error while deleting project');
    }
  }
};

// Add a collaborator to a project by email
export const addProjectCollaborator = async (projectId, email, role) => {
  try {
    console.log('API: Adding collaborator:', { projectId, email, role });
    const response = await api.post(`/api/projects/${projectId}/collaborators`, { email, role });
    console.log('API: Add collaborator response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Add collaborator error:', error);
    
    // Detailed error information
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      // Extract important response information if available
      responseError: error.response?.data?.error,
      responseMessage: error.response?.data?.message,
      stack: error.stack
    };
    
    console.error('API: Error details:', errorDetails);
    
    // Normalize the error object to provide consistent interface
    let errorMessage = 'An error occurred while adding the user.';
    
    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = 'User not found with this email.';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid request. This user may already be added.';
      } else if (error.response.status === 403) {
        errorMessage = 'You do not have permission for this operation.';
      } else if (error.response.status === 500) {
        errorMessage = `Server error: ${error.response.data?.message || 'Unknown error'}`;
      }
    } else if (error.request) {
      errorMessage = 'Server is not responding. Please check your internet connection.';
    }
    
    throw new Error(errorMessage);
  }
};

// Remove a collaborator from a project
export const removeProjectCollaborator = async (projectId, userId) => {
  try {
    console.log('API: Removing collaborator:', { projectId, userId });
    const response = await api.delete(`/api/projects/${projectId}/collaborators/${userId}`);
    console.log('API: Remove collaborator response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Remove collaborator error:', error);
    
    // Detailed error information
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      // Extract important response information if available
      responseError: error.response?.data?.error,
      responseMessage: error.response?.data?.message,
      stack: error.stack
    };
    
    console.error('API: Error details:', errorDetails);
    
    // Normalize the error object to provide consistent interface
    let errorMessage = 'An error occurred while removing the user.';
    
    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = 'User or project not found.';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid request.';
      } else if (error.response.status === 403) {
        errorMessage = 'You do not have permission for this operation.';
      } else if (error.response.status === 500) {
        errorMessage = `Server error: ${error.response.data?.message || 'Unknown error'}`;
      }
    } else if (error.request) {
      errorMessage = 'Server is not responding. Please check your internet connection.';
    }
    
    throw new Error(errorMessage);
  }
};

// Search for users by email
export const searchUsersByEmail = async (email) => {
  try {
    const response = await api.get(`/api/users/search?email=${email}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Check user access to a project (debug function)
export const checkProjectAccess = async (projectId) => {
  try {
    console.log('API: Checking access for project:', projectId);
    const response = await api.get(`/projects/${projectId}/check-access`);
    console.log('API: Access check response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Access check error:', error);
    throw {
      message: 'Failed to check project access',
      details: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      }
    };
  }
};

export const getPublicProject = async (id) => {
  try {
    console.log('Fetching public project:', id);
    const response = await api.get(`/api/projects/public/${id}`);
    console.log('Public project response:', response);
    return response.data;
  } catch (error) {
    console.error('API error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response) {
      switch (error.response.status) {
        case 403:
          throw new Error('This project is private');
        case 404:
          throw new Error('Project not found');
        default:
          throw new Error(error.response.data?.message || 'Failed to fetch project');
      }
    } else if (error.request) {
      throw new Error('Server is not responding. Please check your internet connection');
    } else {
      throw new Error('An error occurred while fetching the project');
    }
  }
};

export const toggleProjectVisibility = async (id) => {
  try {
    const response = await api.patch(`/api/projects/${id}/toggle-visibility`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to toggle project visibility');
    } else {
      throw new Error('Network error while toggling project visibility');
    }
  }
};

export default api;