import { User } from "@/types/user";
import { Building2, MapPin } from "lucide-react";

export default function DepartmentInfo({ user }: { user: User }) {
  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Departmental Info</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1.5 bg-blue/10 rounded-md">
              <Building2 size={15} className="text-blue" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Primary Department
              </p>
              <p className="text-sm text-gray-700 mt-0.5">
                {user?.rollNo ?? "Biomedical Engineering & Sciences"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1.5 bg-blue/10 rounded-md">
              <MapPin size={15} className="text-blue" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Office Location
              </p>
              <p className="text-sm text-gray-700 mt-0.5">
                {user?.rollNo ?? "North Campus, Lab Wing 402"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
