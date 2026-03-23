import { Lock } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";

interface UpdatePasswordProps {
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  handleDiscard: () => void;
  handleSubmit: () => void;
}

export default function UpdatePassword({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  handleDiscard,
  handleSubmit,
}: UpdatePasswordProps) {
  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Security & Access</h3>
          <Lock size={16} className="text-gray-300" />
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue/5 mb-4">
          <div className="mt-0.5 p-1.5 bg-blue/10 rounded-md shrink-0">
            <Lock size={14} className="text-blue" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue">Update Password</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Ensure your password is at least 12 characters long, including a
              mix of letters, numbers, and institutional symbols.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            name="curr_password"
            label="CURRENT PASSWORD"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Input
            name="new_password"
            label="NEW PASSWORD"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          onClick={handleDiscard}
          className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
        >
          Discard Changes
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="px-5 py-2.5 text-sm font-semibold bg-blue text-white rounded-lg hover:bg-blue/90 transition-colors"
        >
          Save Profile
        </Button>
      </div>
    </>
  );
}
