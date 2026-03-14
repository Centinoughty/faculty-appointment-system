import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <>
      <div className="relative w-full max-w-md hidden md:block">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={20} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search for students..."
          className="block max-w-80 pl-10 pr-3 py-2 rounded-md text-sm tracking-wide border border-gray-200 focus:outline-none"
        />
      </div>
    </>
  );
}
