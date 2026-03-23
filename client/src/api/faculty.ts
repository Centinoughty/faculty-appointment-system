import { api } from "./axios";

export async function getFaculties() {
  const { data } = await api.get("/faculty");
  return data;
}

export async function getFacultySlots({
  facultyId,
  date,
}: {
  facultyId: string;
  date: Date;
}): Promise<string[]> {
  const { data } = await api.get("/faculty/available-slots", {
    params: {
      facultyId,
      date: date.toISOString(),
    },
  });

  return data;
}
