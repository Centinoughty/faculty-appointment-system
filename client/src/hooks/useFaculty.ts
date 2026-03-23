"use client";

import { getFaculties } from "@/api/faculty";
import { Faculty } from "@/types/appointment";
import { useQuery } from "@tanstack/react-query";

const EMPTY_FACULTIES: Faculty[] = [
  {
    id: "1",
    name: "gdfsgv",
    email: "bdhkfbsdfhbfsdibifsgv",
    picture: "https://picsum.photos/200/300",
    department: { id: "1", name: "ugfefigb" },
  },
  {
    id: "2",
    name: "idugbfisdu",
    email: "bdhkfbsdfhbfsdigsdfiggv",
    picture: "https://picsum.photos/200/300",
    department: { id: "2", name: "vjebt" },
  },
  {
    id: "3",
    name: "isdugfuiew",
    email: "bdhkfbsdfhbfiusdgbfiusev",
    picture: "https://picsum.photos/200/300",
    department: { id: "3", name: "4t643" },
  },
  {
    id: "4",
    name: "iuerfg",
    email: "bdhkfbsdfhbfsdidgsdvgv",
    picture: "https://picsum.photos/200/300",
    department: { id: "4", name: "dfb" },
  },
  {
    id: "5",
    name: "39urreifon",
    email: "bdhkfbsdfhbfsdsfdsjf",
    picture: "https://picsum.photos/200/300",
    department: { id: "5", name: "szbt" },
  },
];

export default function useFaculty() {
  const query = useQuery({
    queryKey: ["faculty"],
    queryFn: getFaculties,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  const faculties: Faculty[] = query.data ?? EMPTY_FACULTIES;

  return {
    faculties,

    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
