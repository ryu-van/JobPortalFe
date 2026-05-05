import axiosClient from "./axiosClient";

const resumeApi = {
  parseAi(content) {
    return axiosClient.post("/resumes/parse-ai", { content });
  },

  create(data) {
    return axiosClient.post("/resumes", data);
  },

  update(id, data) {
    return axiosClient.put(`/resumes/${id}`, data);
  },

  delete(id) {
    return axiosClient.delete(`/resumes/${id}`);
  },

  getById(id) {
    return axiosClient.get(`/resumes/${id}`);
  },

  getAllResumes(isPublic) {
    return axiosClient.get("/resumes", { params: { isPublic } });
  },

  setPrimary(id, isPrimary) {
    return axiosClient.patch(`/resumes/${id}/primary`, null, { params: { isPrimary } });
  },

  setPublic(id, isPublic) {
    return axiosClient.patch(`/resumes/${id}/public`, null, { params: { isPublic } });
  },
  uploadCv(file) {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post("/resumes/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadFile(formData) {
    return axiosClient.post("/resumes/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default resumeApi;
