import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

type EventColor =
  | "gray"
  | "lightBlue"
  | "solidBlue"
  | "solidGreen"
  | "lightOrange";

interface ScheduleEvent {
  id: string;
  title: string;
  time?: string;
  color: EventColor;
}

interface DaySchedule {
  dayName: string;
  date: string;
  isActive?: boolean;
  events: ScheduleEvent[];
}

const weekData: DaySchedule[] = [
  {
    dayName: "MON",
    date: "23",
    events: [{ id: "1", title: "CS201 Lecture", color: "gray" }],
  },
  {
    dayName: "TUE",
    date: "24",
    events: [],
  },
  {
    dayName: "WED",
    date: "25",
    events: [{ id: "2", title: "Lab: Compiler Design", color: "lightBlue" }],
  },
  {
    dayName: "THU",
    date: "26",
    isActive: true,
    events: [
      {
        id: "3",
        time: "10:00 AM -",
        title: "Dept Meeting",
        color: "solidBlue",
      },
      {
        id: "4",
        time: "02:30 PM -",
        title: "Research Review",
        color: "solidGreen",
      },
    ],
  },
  {
    dayName: "FRI",
    date: "27",
    events: [{ id: "5", title: "Faculty Seminar", color: "lightOrange" }],
  },
  {
    dayName: "SAT",
    date: "28",
    events: [],
  },
  {
    dayName: "SUN",
    date: "29",
    events: [],
  },
];

// --- Helper Function for Colors ---
// Replaces clsx by returning standard Tailwind strings based on the color type
const getEventStyles = (color: EventColor) => {
  switch (color) {
    case "gray":
      return "bg-gray-100 text-gray-700 font-semibold";
    case "lightBlue":
      return "bg-blue-50 text-primary font-bold";
    case "solidBlue":
      return "bg-primary text-white font-bold";
    case "solidGreen":
      return "bg-[#10b981] text-white font-bold"; // Using a specific emerald/green hex
    case "lightOrange":
      return "bg-orange-50 text-[#ea580c] font-bold border-l-2 border-[#ea580c]"; // Added the left border seen in the design
    default:
      return "bg-gray-100 text-gray-700";
  }
};

// --- Main Component ---
export default function WeeklySchedule() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Weekly Schedule
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-gray-800">
            Oct 23 - Oct 29, 2023
          </span>
          <button className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="w-full">
        {/* Days Header */}
        <div className="grid grid-cols-7 mb-2">
          {weekData.map((day, index) => (
            <div key={index} className="text-center">
              <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">
                {day.dayName}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Body (Dates & Events) */}
        <div className="grid grid-cols-7 border border-gray-100 rounded-lg overflow-hidden bg-gray-50/30">
          {weekData.map((day, index) => (
            <div
              key={index}
              className={`min-h-40 p-2 border-r border-gray-100 last:border-r-0 relative transition-all ${
                day.isActive
                  ? "bg-white ring-2 ring-primary ring-inset rounded-lg z-10 shadow-sm"
                  : "bg-white"
              }`}
            >
              {/* Date Number */}
              <div
                className={`text-sm mb-3 ml-1 ${day.isActive ? "font-bold text-primary" : "font-medium text-gray-500"}`}
              >
                {day.date}
              </div>

              {/* Events List */}
              <div className="flex flex-col gap-2">
                {day.events.map((event) => (
                  <div
                    key={event.id}
                    className={`p-2 rounded-md text-xs leading-tight ${getEventStyles(event.color)}`}
                  >
                    {event.time && (
                      <span className="block mb-0.5">{event.time}</span>
                    )}
                    <span>{event.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
