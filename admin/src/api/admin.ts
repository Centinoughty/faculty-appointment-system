import { api } from "./axios";

export const adminApi = {
    getFaculties: () => api.get("/student/faculty", { withCredentials: true }),
}