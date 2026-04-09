import { api } from "./axios";

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl: string | null;
}

export const notificationApi = {
  getNotifications: () => api.get<Notification[]>("notifications"),
  markAsRead: (id: number) => api.put(`notifications/${id}/read`)
};
