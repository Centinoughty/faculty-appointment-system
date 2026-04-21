import { api } from "./axios";

export const adminApi = {
    getFaculties: () => api.get("/admin/faculties", { withCredentials: true }),
    getStudents: () => api.get("/admin/students", { withCredentials: true }),
    getDepartments: () => api.get("/admin/departments", { withCredentials: true }),
    createFaculty: (data: any) => api.post("/admin/faculties", data, { withCredentials: true }),
    updateFaculty: (id: number, data: any) => api.put(`/admin/faculties/${id}`, data, { withCredentials: true }),
    deleteFaculty: (id: number) => api.delete(`/admin/faculties/${id}`, { withCredentials: true }),
    createStudent: (data: any) => api.post("/admin/students", data, { withCredentials: true }),
    updateStudent: (id: number, data: any) => api.put(`/admin/students/${id}`, data, { withCredentials: true }),
    deleteStudent: (id: number) => api.delete(`/admin/students/${id}`, { withCredentials: true }),
    createDepartment: (data: any) => api.post("/admin/departments", data, { withCredentials: true }),
    updateDepartment: (id: number, data: any) => api.put(`/admin/departments/${id}`, data, { withCredentials: true }),
    deleteDepartment: (id: number) => api.delete(`/admin/departments/${id}`, { withCredentials: true }),
    uploadTimetable: (id: number, formData: FormData) =>
        api.post(`/admin/faculty/upload-slots?faculty_id=${id}`, formData, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" }
        }),
    uploadBulkFaculties: (formData: FormData) =>
        api.post("/admin/upload-faculty", formData, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" }
        }),
    uploadBulkStudents: (formData: FormData) =>
        api.post("/admin/upload-students", formData, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" }
        }),
    uploadBulkDepartments: (formData: FormData) =>
        api.post("/admin/upload-departments", formData, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" }
        }),
    getAppointments: () => api.get("/admin/appointments", { withCredentials: true }),
    getStats: () => api.get("/admin/stats", { withCredentials: true }),
    exportAppointments: () => api.get("/admin/export-appointments", { withCredentials: true, responseType: 'blob' }),
    uploadTimetablePDF: (formData: FormData) => api.post("/admin/upload-timetable", formData, { withCredentials: true }),
    getTimetableStatus: () => api.get("/admin/setup-status", { withCredentials: true }),
    toggleBlacklist: (id: number) => api.put(`/admin/students/${id}/blacklist`, {}, { withCredentials: true }),
}