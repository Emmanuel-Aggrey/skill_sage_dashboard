import { client } from "../utils/http";

const getCourses = async () => {
  const resp = await client.get("/course");
  return resp.data;
};

const addCourse = async (formData) => {
  const resp = await client.post("/course", formData);
  console.log(resp.data);
  return resp.data;
};

const addSession = async (formData) => {
  const resp = await client.post("/course/session", formData);
  console.log(resp.data);
  return resp.data;
};

const removeSession = async (id) => {
  const resp = await client.delete(`/course/session/${id}`);
  return resp.data;
}

const addItem = async (formData) => {
  const resp = await client.post("/course/item", formData);
  console.log(resp.data);
  return resp.data;
};

const removeItem = async (id) => {
  const resp = await client.delete(`/course/item/${id}`);
  return resp.data;
}

const removeCourse = async (id) => {
  const resp = await client.delete(`/course/${id}`);
  console.log(resp.data);
  return resp.data;
};

const updateCourse = async (formData, id) => {
  const resp = await client.put(`/course/${id}`, formData);
  console.log(resp);
  return resp.data;
};

export {
  addCourse,
  getCourses,
  removeCourse,
  updateCourse,
  addSession,
  addItem,
  removeItem,
  removeSession,
};
