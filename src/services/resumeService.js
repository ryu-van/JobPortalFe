import handleApi from "@/utils/handleApi";
import resumeApi from "@/api/resumeApi";

const resumeService = {
  async parseAiResume(content) {
    return handleApi(() => resumeApi.parseAi(content));
  },

  async create(data) {
    return handleApi(() => resumeApi.create(data));
  },

  async createResume(data) {
    return handleApi(() => resumeApi.create(data));
  },

  async updateResume(id, data) {
    return handleApi(() => resumeApi.update(id, data));
  },

  async deleteResume(id) {
    return handleApi(() => resumeApi.delete(id));
  },

  async getResume(id) {
    return handleApi(() => resumeApi.getById(id));
  },

  async getAll(params) {
    return handleApi(() => resumeApi.getAllResumes(params?.isPublic));
  },

  async setPrimaryResume(id, isPrimary) {
    return handleApi(() => resumeApi.setPrimary(id, isPrimary));
  },

  async setPublicResume(id, isPublic) {
    return handleApi(() => resumeApi.setPublic(id, isPublic));
  },

  async getResumes(isPublic) {
    return handleApi(() => resumeApi.getAllResumes(isPublic));
  },
  async uploadCv(file) {
    return handleApi(() => resumeApi.uploadCv(file));
  },

  async uploadResume(file) {
    const formData = new FormData();
    formData.append("file", file);
    return handleApi(() => resumeApi.uploadFile(formData));
  }
};

export default resumeService;
