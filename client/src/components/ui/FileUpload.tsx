import { Upload } from "lucide-react";

interface FileUploadProps {
  label?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  hint?: string;
}

export default function FileUpload({
  label,
  file,
  onChange,
  accept = ".pdf,.jpg,.jpeg,.png",
  hint = "PDF, JPG or PNG (max 5MB)",
}: FileUploadProps) {
  return (
    <div>
      {label && (
        <label className="text-sm font-semibold text-gray-500 mb-2 block">
          {label}
        </label>
      )}
      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-blue/40 hover:bg-blue/5 transition-colors">
        <Upload size={20} className="text-gray-400" />

        {file ? (
          <span className="text-xs text-blue font-medium">{file.name}</span>
        ) : (
          <>
            <span className="text-xs text-gray-500">
              <span className="text-blue font-semibold">Click to upload</span>{" "}
              or drag and drop
            </span>
            <span className="text-[10px] text-gray-400">{hint}</span>
          </>
        )}

        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}
