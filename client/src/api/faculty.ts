import { api } from "./axios";

export const getFaculty = async () => {
  const { data } = await api.get("/faculty");
  return data;
};
