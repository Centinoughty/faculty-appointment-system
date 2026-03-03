import { Faculty, TimeSlot, AppointmentRequest } from "../types/dashboard";

export const mockFaculty: Faculty[] = [
  {
    id: "f1",
    name: "Dr. Smitha K",
    department: "Computer Science",
    keywords: ["AI", "Machine Learning", "Data Science"],
  },
  {
    id: "f2",
    name: "Prof. Rajesh M",
    department: "Electronics and Communication",
    keywords: ["VLSI", "Signal Processing", "Embedded Systems"],
  },
  {
    id: "f3",
    name: "Dr. Anjali Menon",
    department: "Computer Science",
    keywords: ["Cybersecurity", "Networks", "Cryptography"],
  },
  {
    id: "f4",
    name: "Dr. Thomas James",
    department: "Mathematics",
    keywords: ["Linear Algebra", "Optimization", "Graph Theory"],
  },
];

// Generate some dummy slots for today and tomorrow
const today = new Date().toISOString().split("T")[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

export const mockSlots: TimeSlot[] = [
  {
    id: "s1",
    facultyId: "f1",
    date: today,
    startTime: "10:00 AM",
    endTime: "10:30 AM",
    isAvailable: true,
  },
  {
    id: "s2",
    facultyId: "f1",
    date: today,
    startTime: "11:00 AM",
    endTime: "11:30 AM",
    isAvailable: true,
  },
  {
    id: "s3",
    facultyId: "f1",
    date: tomorrow,
    startTime: "02:00 PM",
    endTime: "02:30 PM",
    isAvailable: true,
  },

  {
    id: "s4",
    facultyId: "f2",
    date: today,
    startTime: "09:00 AM",
    endTime: "09:30 AM",
    isAvailable: true,
  },
  {
    id: "s5",
    facultyId: "f2",
    date: tomorrow,
    startTime: "03:00 PM",
    endTime: "03:30 PM",
    isAvailable: true,
  },

  {
    id: "s6",
    facultyId: "f3",
    date: today,
    startTime: "01:00 PM",
    endTime: "01:30 PM",
    isAvailable: false,
  }, // booked
  {
    id: "s7",
    facultyId: "f3",
    date: tomorrow,
    startTime: "10:00 AM",
    endTime: "10:30 AM",
    isAvailable: true,
  },
];

export let mockRequests: AppointmentRequest[] = [
  {
    id: "r1",
    slotId: "s6",
    facultyId: "f3",
    studentId: "student-1", // dummy student
    purpose: "Project Discussion",
    description:
      "I wanted to discuss my final year project topic regarding network security.",
    status: "Confirmed",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
  },
];

// Helper to add a request (simulate backend)
export const addMockRequest = (
  req: Omit<AppointmentRequest, "id" | "createdAt" | "status">,
) => {
  const newReq: AppointmentRequest = {
    ...req,
    id: `r${mockRequests.length + 2}`,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };
  mockRequests = [newReq, ...mockRequests];
  return newReq;
};
