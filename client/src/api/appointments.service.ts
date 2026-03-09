import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Appointment } from "@/types/appointment";

const APPOINTMENTS_COLLECTION = "appointments";
const FACULTY_COLLECTION = "faculty";
const NOTIFICATIONS_COLLECTION = "notifications";
const USERS_COLLECTION = "users";

export const appointmentService = {
  // Get user profile
  getUserProfile: async (email: string) => {
    try {
      const q = query(
        collection(db, USERS_COLLECTION),
        where("email", "==", email),
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      console.error("error in getUserProfile", error);
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (id: string, data: any) => {
    try {
      const docRef = doc(db, USERS_COLLECTION, id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error("error in updateUserProfile", error);
      throw error;
    }
  },

  // Create user profile if not exists
  ensureUserProfile: async (email: string, initialData: any) => {
    try {
      const existing = await appointmentService.getUserProfile(email);
      if (!existing) {
        await addDoc(collection(db, USERS_COLLECTION), {
          ...initialData,
          email,
        });
      }
    } catch (error) {
      console.error("error in ensureUserProfile", error);
      throw error;
    }
  },

  // Get notifications for a user
  getNotifications: (
    userId: string,
    callback: (notifications: any[]) => void,
  ) => {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where("userId", "==", userId),
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(notifications);
    });
  },

  // Mark all as read
  markNotificationsAsRead: async (userId: string) => {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where("userId", "==", userId),
      where("unread", "==", true),
    );
    const snapshot = await getDocs(q);
    for (const d of snapshot.docs) {
      await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, d.id), {
        unread: false,
      });
    }
  },

  // Get all faculties
  getFaculties: async () => {
    const querySnapshot = await getDocs(collection(db, FACULTY_COLLECTION));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  // Get single faculty
  getFacultyById: async (id: string) => {
    const docRef = doc(db, FACULTY_COLLECTION, id);
    const docSnap = await getDocs(
      query(collection(db, FACULTY_COLLECTION), where("__name__", "==", id)),
    );
    // simplified for brevity
    return docSnap.docs[0]?.data();
  },

  // Get all appointments for a student
  getStudentAppointments: (
    studentId: string,
    callback: (appointments: Appointment[]) => void,
  ) => {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where("studentId", "==", studentId),
    );

    return onSnapshot(q, (snapshot) => {
      const appointments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];
      callback(appointments);
    });
  },

  // Create a new appointment request
  createAppointment: async (appointment: Omit<Appointment, "id">) => {
    try {
      const docRef = await addDoc(
        collection(db, APPOINTMENTS_COLLECTION),
        appointment,
      );
      return docRef.id;
    } catch (error) {
      console.error("Error adding document: ", error);
      throw error;
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (
    appointmentId: string,
    status: Appointment["status"],
  ) => {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    await updateDoc(docRef, { status });
  },

  // Cancel/Delete appointment
  cancelAppointment: async (appointmentId: string) => {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    await deleteDoc(docRef);
  },

  // Seed Faculty Data
  seedFaculties: async (faculties: any[]) => {
    for (const faculty of faculties) {
      const { id, ...data } = faculty;
      await addDoc(collection(db, FACULTY_COLLECTION), data);
    }
  },

  // Seed Notifications
  seedNotifications: async (userId: string, notifications: any[]) => {
    for (const notification of notifications) {
      await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
        ...notification,
        userId,
      });
    }
  },
};
