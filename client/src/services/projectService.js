import axios from "../utils/api";

// Get all projects for the user
export const getUserProjects = async () => {
  try {
    const res = await axios.get("/api/projects");
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get a single project by id
export const getProjectById = async (id) => {
  try {
    const res = await axios.get(`/api/projects/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create a new project
export const createProject = async (projectData) => {
  try {
    const res = await axios.post("/api/projects", projectData);
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update an existing project
export const updateProject = async (id, projectData) => {
  try {
    const res = await axios.put(`/api/projects/${id}`, projectData);
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete a project
export const deleteProject = async (id) => {
  try {
    const res = await axios.delete(`/api/projects/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Add a collaborator to a project
export const addCollaborator = async (projectId, email, role) => {
  try {
    const res = await axios.post(`/api/projects/${projectId}/collaborators`, { email, role });
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Remove a collaborator from a project
export const removeCollaborator = async (projectId, userId) => {
  try {
    const res = await axios.delete(`/api/projects/${projectId}/collaborators/${userId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get users by email for collaboration
export const getUsersByEmail = async (email) => {
  try {
    const res = await axios.get(`/api/users/search?email=${email}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 