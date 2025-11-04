import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// Share document with another user
export const shareDocument = async (id, email, role) => {
  const res = await API.post(`/documents/${id}/share`, { email, role });
  return res.data;
};

// Revoke access from a user
export const revokeAccess = async (id, userId) => {
  const res = await API.delete(`/documents/${id}/revoke`, { data: { userId } });
  return res.data;
};

// Get shared users list
export const getSharedUsers = async (id) => {
  const res = await API.get(`/documents/${id}/shared`);
  return res.data.sharedWith;
};
