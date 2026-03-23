import { User } from "@/types/user";
import Image from "next/image";

export default function ProfileCard({ user }: { user: User }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="h-20 bg-blue/10" />

      <div className="px-5 pb-5 -mt-15 flex flex-col items-center text-center">
        <div
          style={{ width: "100px", height: "100px", position: "relative" }}
          className="rounded-full border-4 border-white overflow-hidden shadow-sm"
        >
          <Image
            src={user?.picture}
            alt={user?.name}
            fill
            sizes="100px"
            style={{ objectFit: "cover" }}
          />
        </div>

        <p className="mt-3 font-bold text-gray-900 text-lg">{user?.name}</p>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-0.5">
          Student
        </p>

        <div className="w-full mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Account Status
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Active
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Institutional ID
            </span>
            <span className="text-xs font-mono text-gray-600">
              {user?.rollNumber}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
