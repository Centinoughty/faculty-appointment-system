"use client";

import useUser from "@/hooks/useUser";
import ProfileCard from "../common/ProfileCard";
import Title from "../ui/Title";
import DepartmentInfo from "../common/DepartmentInfo";
import AccountInfo from "../common/AccountInfo";
import UpdatePassword from "../common/UpdatePassword";
import { useState } from "react";

export default function StudentSettings() {
  const { user } = useUser();

  const [phone, setPhone] = useState<string>(user?.phone ?? "");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");

  function handleDiscard() {
    setPhone(user?.phone ?? "");
    setCurrentPassword("");
    setNewPassword("");
  }

  function handleSubmit() {}

  return (
    <>
      <div className="grow p-4 bg-[#f6f6f8]">
        <div>
          <Title text="Profile Settings">
            Manage your institutional identity and account preferences.
          </Title>
        </div>

        <div className="mt-5 flex gap-4">
          <div className="flex flex-col gap-4">
            <ProfileCard user={user} />
            <DepartmentInfo user={user} />
          </div>

          <div className="flex flex-col gap-4">
            <AccountInfo user={user} phone={phone} setPhone={setPhone} />
            <UpdatePassword
              currentPassword={currentPassword}
              newPassword={newPassword}
              setCurrentPassword={setCurrentPassword}
              setNewPassword={setNewPassword}
              handleDiscard={handleDiscard}
              handleSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </>
  );
}
