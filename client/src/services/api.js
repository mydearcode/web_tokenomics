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

// Add a collaborator to a project by email
export const addProjectCollaborator = async (projectId, email, role) => {
  try {
    console.log('API: Adding collaborator:', { projectId, email, role });
    const response = await api.post(`/projects/${projectId}/collaborators`, { email, role });
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
    let errorMessage = 'Kullanıcı eklenirken bir hata oluştu.';
    
    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = 'Kullanıcı bu e-posta ile bulunamadı.';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Geçersiz istek. Bu kullanıcı zaten eklenmiş olabilir.';
      } else if (error.response.status === 403) {
        errorMessage = 'Bu işlem için yetkiniz bulunmuyor.';
      } else if (error.response.status === 500) {
        errorMessage = `Sunucu hatası: ${error.response.data?.message || 'Bilinmeyen hata'}`;
      }
    } else if (error.request) {
      errorMessage = 'Sunucu yanıt vermiyor. İnternet bağlantınızı kontrol edin.';
    }
    
    throw { 
      message: errorMessage,
      details: errorDetails 
    };
  }
};

// Remove a collaborator from a project
export const removeProjectCollaborator = async (projectId, userId) => {
  try {
    console.log('API: Removing collaborator:', { projectId, userId });
    const response = await api.delete(`/projects/${projectId}/collaborators/${userId}`);
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
    let errorMessage = 'Kullanıcı kaldırılırken bir hata oluştu.';
    
    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = 'Kullanıcı veya proje bulunamadı.';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Geçersiz istek.';
      } else if (error.response.status === 403) {
        errorMessage = 'Bu işlem için yetkiniz bulunmuyor.';
      } else if (error.response.status === 500) {
        errorMessage = `Sunucu hatası: ${error.response.data?.message || 'Bilinmeyen hata'}`;
      }
    } else if (error.request) {
      errorMessage = 'Sunucu yanıt vermiyor. İnternet bağlantınızı kontrol edin.';
    }
    
    throw { 
      message: errorMessage,
      details: errorDetails 
    };
  }
};

// Search for users by email
export const searchUsersByEmail = async (email) => {
  try {
    const response = await api.get(`/users/search?email=${email}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
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

export default api; 