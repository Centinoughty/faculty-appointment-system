import { User } from "@/types/user";
import { Lock, Pencil } from "lucide-react";
import Input from "../ui/Input";
import { ChangeEvent } from "react";

export default function AccountInfo({
  user,
  phone,
  onChange,
}: {
  user: User;
  phone: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
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
              className="bg-[#f6f6f8]"
            />

            <Input
              name="email"
              label="INSTITUTIONAL EMAIL"
              value=""
              readonly
              onChange={() => null}
              placeholder={user?.email ?? "nadeem_b230440cs@nitc.ac.in"}
              className="bg-[#f6f6f8]"
            />
          </div>

          <Input
            name="Phone Number"
            label="PHONE NUMBER"
            value={phone}
            icon={Pencil}
            onChange={onChange}
            placeholder="+91 8887776665"
            className="bg-[#f6f6f8]/50"
          />
        </div>
      </div>
    </>
  );
}
