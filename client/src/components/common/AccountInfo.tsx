import { User } from "@/types/user";
import { Lock } from "lucide-react";
import Input from "../ui/Input";

export default function AccountInfo({
  user,
  phone,
  setPhone,
}: {
  user: User;
  phone: string;
  setPhone: (value: string) => void;
}) {
  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Personal Identity</h3>
          <Lock size={16} className="text-gray-300" />
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              name="name"
              label="FULL NAME"
              value=""
              readonly
              onChange={() => null}
              placeholder={user?.phone ?? "Nadeem M Siyam"}
            />

            <Input
              name="email"
              label="INSTITUTIONAL EMAIL"
              value=""
              readonly
              onChange={() => null}
              placeholder={user?.email ?? "nadeem_b230440cs@nitc.ac.in"}
            />
          </div>

          <Input
            name="Phone Number"
            label="PHONE NUMBER"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 8887776665"
          />
        </div>
      </div>
    </>
  );
}
