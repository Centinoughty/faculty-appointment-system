import { api } from "./axios";

export async function getFaculties() {
  const { data } = await api.get("/faculty");
  return data;
}

export async function getFacultySlots({
  facultyId,
  date,
}: {
  facultyId: number;
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

export async function blockSlot({
  date,
  startTime,
}: {
  date: Date;
  startTime: string;
}): Promise<void> {
  await api.post("/faculty/block", {
    date: date.toISOString(),
    startTime,
  });
}
