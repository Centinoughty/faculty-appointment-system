"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Calendar from "react-calendar";
import { User } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/TextArea";
import FileUpload from "@/components/ui/FileUpload";
import SlotPicker from "@/components/ui/SlotPicker";
import useAvailableSlots from "@/hooks/useAvailableSlots";
import useAppointment from "@/hooks/useAppointment";
import useFaculty from "@/hooks/useFaculty";
import ClientOnly from "../ui/ClientOnly";

import "react-calendar/dist/Calendar.css";
import "@/styles/calendar.css";

export default function AppointmentForm() {
  const today = useMemo(() => new Date(), []);

  const searchParams = useSearchParams();
  const rawId = searchParams.get("id");
  const selectedFacultyId = rawId ? Number(rawId) : undefined;
  const isFacultyLocked = !!selectedFacultyId;

  const { formData, handleChange, resetForm, createItem, isCreating } = useAppointment(
    selectedFacultyId ?? undefined,
  );

  const { faculties } = useFaculty();

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const selectedFaculty = faculties.find((f) => f.id === formData.facultyId);

  const facultyOptions = faculties.map((f) => ({
    value: f.id,
    label: `${f.name} — ${f.department.name}`,
  }));

  const { availableSlots, isLoading: slotsLoading } = useAvailableSlots(
    formData.facultyId,
    formData.date,
  );

  const selectedDateLabel = formData.date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <form
      onSubmit={createItem}
      className="mt-10 w-full max-w-4xl bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-7 border-r border-gray-100 flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Book Appointment
            </h1>
            {selectedFaculty ? (
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                <User size={13} />
                Scheduling with {selectedFaculty.name}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">
                Select a faculty to get started.
              </p>
            )}
          </div>

          {isFacultyLocked ? (
            <div>
              <label className="text-sm font-semibold text-gray-500 mb-2 block">
                Faculty
              </label>
              <div className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-500 cursor-not-allowed">
                {selectedFaculty?.name} — {selectedFaculty?.department.name}
              </div>
            </div>
          ) : (
            <Select
              name="faculty"
              label="Faculty"
              value={formData.facultyId}
              onChange={(e) => {
                handleChange("facultyId", e);
                setSelectedSlot(null);
              }}
              options={facultyOptions}
              placeholder="Select a professor..."
              required
            />
          )}

          <ClientOnly>
            <Calendar
              value={formData.date}
              onChange={(e) => {
                handleChange("date", e as Date);
                setSelectedSlot(null);
              }}
              minDate={today}
              locale="en-US"
            />
          </ClientOnly>

          <SlotPicker
            label="Select an Available Slot"
            slots={availableSlots}
            selected={selectedSlot}
            onChange={setSelectedSlot}
            isLoading={slotsLoading}
            isEmpty={
              !slotsLoading &&
              availableSlots.length === 0 &&
              !!formData.facultyId
            }
            disabled={!formData.facultyId}
          />
        </div>

        <div className="p-7 flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Appointment Details
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {selectedSlot
                ? `${selectedDateLabel} • ${selectedSlot}`
                : "Pick a date and slot on the left."}
            </p>
          </div>

          <Input
            name="topic"
            label="Reason for Appointment"
            value={formData.topic}
            onChange={(e) => handleChange("topic", e.target.value)}
            placeholder="e.g. Project Discussion, Thesis Review..."
            required
          />

          <Textarea
            name="description"
            label="Description"
            rows={4}
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Briefly explain what you'd like to discuss..."
          />

          <FileUpload
            label="Upload Supporting Files"
            file={file}
            onChange={setFile}
          />

          <div className="flex flex-col gap-2 mt-auto">
            <Button
              type="submit"
              disabled={
                isCreating ||
                !formData.facultyId ||
                !formData.date ||
                !selectedSlot ||
                !formData.topic
              }
              className="w-full py-3 bg-blue text-white text-sm font-semibold hover:bg-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? "Booking..." : "Confirm Booking"}
            </Button>

            <Button
              type="button"
              onClick={resetForm}
              className="w-full py-3 text-sm font-semibold text-gray-600 hover:text-gray-800"
            >
              Discard
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
