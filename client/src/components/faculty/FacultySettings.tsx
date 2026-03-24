"use client";

import useUser from "@/hooks/useUser";
import ProfileCard from "../common/ProfileCard";
import Title from "../ui/Title";
import DepartmentInfo from "../common/DepartmentInfo";
import AccountInfo from "../common/AccountInfo";
import UpdatePassword from "../common/UpdatePassword";
import FileUpload from "../ui/FileUpload";
import { useState } from "react";

export default function FacultySettings() {
  const { formData, handleChange, resetForm, updateItem, user } = useUser();

  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="grow p-4 bg-[#f6f6f8]">
      <div>
        <Title text="Profile Settings">
          Manage your institutional identity and account preferences.
        </Title>
      </div>

      <div className="mt-5 flex justify-start gap-4">
        <div className="flex flex-col gap-4">
          <ProfileCard user={user} />
          <DepartmentInfo user={user} />
        </div>

        <div className="flex flex-col gap-4">
          <AccountInfo
            user={user}
            phone={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />

          <UpdatePassword
            currentPassword={formData.currentPassword}
            newPassword={formData.newPassword}
            setCurrentPassword={(e) =>
              handleChange("currentPassword", e.target.value)
            }
            setNewPassword={(e) => handleChange("newPassword", e.target.value)}
            handleDiscard={resetForm}
            handleSubmit={updateItem}
          />
        </div>

        <div className="h-min bg-white rounded-xl border border-gray-200 p-5">
          <FileUpload
            label="Upload Timetable"
            file={file}
            onChange={setFile}
            accept=".csv,.xlsx,.xls"
            hint="CSV or Excel (.xlsx, .xls)"
          />
        </div>
      </div>
    </div>
  );
}
