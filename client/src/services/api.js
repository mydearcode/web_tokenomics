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
      console.log('Token added to request:', {
        url: config.url,
        method: config.method,
        token: token.substring(0, 10) + '...'
      });
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
      const message = error.response.data.message || 'An error occurred';
      console.error('API Error:', {
        status: error.response.status,
        message: message,
        data: error.response.data
      });
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server:', error.request);
      return Promise.reject(new Error('No response from server'));
    } else {
      // Request setup error
      console.error('Request setup error:', error.message);
      return Promise.reject(new Error('Error setting up request'));
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
      
      // Set default authorization header for all future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      console.log('Token stored and headers updated:', {
        token: response.data.token.substring(0, 10) + '...',
        user: response.data.user
      });
    }
    return response.data;
  } catch (error) {
    console.error('Login error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    // Return a more specific error message
    if (error.response?.status === 400) {
      throw new Error('Geçersiz e-posta veya şifre');
    } else if (error.response?.status === 401) {
      throw new Error('Kimlik doğrulama başarısız');
    } else {
      throw new Error(error.response?.data?.message || 'Giriş başarısız oldu');
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
    console.log('Creating project with data:', JSON.stringify(projectData, null, 2));
    
    // Get the current user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!user || !user._id || !token) {
      console.error('Authentication error:', { user, token });
      throw new Error('Kullanıcı kimliği doğrulanmadı. Lütfen tekrar giriş yapın.');
    }
    
    // Format and validate data structure
    const formattedData = {
      name: projectData.name?.trim(),
      description: projectData.description?.trim(),
      isPublic: Boolean(projectData.isPublic),
      owner: user._id,
      tokenName: projectData.tokenName?.trim(),
      tokenSymbol: projectData.tokenSymbol?.trim(),
      tokenomics: {
        totalSupply: Number(projectData.tokenomics?.totalSupply),
        initialPrice: Number(projectData.tokenomics?.initialPrice),
        maxSupply: Number(projectData.tokenomics?.maxSupply),
        decimals: Number(projectData.tokenomics?.decimals)
      },
      allocation: {},
      vesting: {}
    };

    // Format allocation data
    if (projectData.allocation) {
      Object.entries(projectData.allocation).forEach(([key, value]) => {
        formattedData.allocation[key] = Number(value);
      });
    }

    // Format vesting data
    if (projectData.vesting) {
      Object.entries(projectData.vesting).forEach(([key, value]) => {
        formattedData.vesting[key] = {
          tgePercentage: Number(value.tgePercentage),
          cliffMonths: Number(value.cliffMonths),
          vestingMonths: Number(value.vestingMonths)
        };
      });
    }

    // Validate required fields
    if (!formattedData.name) throw new Error('Proje adı gereklidir');
    if (!formattedData.description) throw new Error('Proje açıklaması gereklidir');
    if (!formattedData.owner) throw new Error('Proje sahibi gereklidir');
    if (!formattedData.tokenName) throw new Error('Token adı gereklidir');
    if (!formattedData.tokenSymbol) throw new Error('Token sembolü gereklidir');
    if (!formattedData.tokenomics.totalSupply) throw new Error('Toplam arz gereklidir');
    if (!formattedData.tokenomics.initialPrice) throw new Error('Başlangıç fiyatı gereklidir');
    if (!formattedData.tokenomics.maxSupply) throw new Error('Maksimum arz gereklidir');
    if (!formattedData.tokenomics.decimals) throw new Error('Ondalık basamak sayısı gereklidir');
    if (Object.keys(formattedData.allocation).length === 0) throw new Error('En az bir dağıtım kategorisi gereklidir');
    if (Object.keys(formattedData.vesting).length === 0) throw new Error('Vesting bilgisi gereklidir');

    // Log the formatted data
    console.log('Formatted project data:', JSON.stringify(formattedData, null, 2));
    
    // Make the request directly with axios
    const response = await axios.post(`${API_URL}/api/projects`, formattedData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Create project response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Create project error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      } else if (error.response.status === 500) {
        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      } else if (error.response.status === 400) {
        throw new Error(error.response.data?.message || 'Geçersiz proje verisi');
      } else {
        throw new Error(error.response.data?.message || 'Proje oluşturulamadı');
      }
    } else if (error.request) {
      throw new Error('Ağ hatası. Lütfen bağlantınızı kontrol edin.');
    } else {
      throw new Error(error.message || 'Proje oluşturulamadı');
    }
  }
};

export const getProjects = async () => {
  try {
    console.log('Fetching projects');
    const response = await api.get('/api/projects');
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
    const response = await api.get(`/api/projects/${id}`);
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
    const response = await api.put(`/api/projects/${id}`, projectData);
    return response.data;
  } catch (error) {
    console.error('Update project error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteProject = async (id) => {
  try {
    const response = await api.delete(`/api/projects/${id}`);
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

export default api;