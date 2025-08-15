import { client } from "../utils/http";

const getApplicants = async () => {
  const resp = await client.get('/job/applicants/')
  return resp.data;
}

const acceptApplication = async (formData) => {
  const resp = await client.put('/job/status/', formData)
  return resp.data;
}

const rejectApplication = async (formData) => {
  const resp = await client.put('/job/status/', formData)
  return resp.data;
}

export {
  getApplicants,
  acceptApplication, rejectApplication,
}