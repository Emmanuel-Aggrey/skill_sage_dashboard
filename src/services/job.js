import { client } from "../utils/http";

const getJobs = async () => {
  const resp = await client.get("/job");
  return resp.data;
};

const addJob = async (formData) => {
  const resp = await client.post("/job", formData);
  console.log(resp.data);
  return resp.data;
};

const removeJob = async (id) => {
  const resp = await client.delete(`/job/${id}`);
  console.log(resp.data);
  return resp.data;
};

const updateJob = async (formData) => {
  const resp = await client.put("/job", formData);
  console.log(resp);
  return resp.data;
};

// External job functions
const scrapeExternalJobs = async () => {
  const resp = await client.post("/user/scrape_jobs");
  return resp.data;
};

const getExternalJobs = async (limit = 50, source = null) => {
  let url = `/user/external_jobs?limit=${limit}`;
  if (source) {
    url += `&source=${source}`;
  }
  const resp = await client.get(url);
  return resp.data;
};

const getRecommendedExternalJobs = async (limit = 20) => {
  const resp = await client.get(`/user/recommend_external_jobs?limit=${limit}`);
  return resp.data;
};

const getAllRecommendedJobs = async (limit = 20) => {
  const resp = await client.get(`/user/recommend_all_jobs?limit=${limit}`);
  return resp.data;
};

export {
  getJobs,
  addJob,
  removeJob,
  updateJob,
  scrapeExternalJobs,
  getExternalJobs,
  getRecommendedExternalJobs,
  getAllRecommendedJobs,
};
