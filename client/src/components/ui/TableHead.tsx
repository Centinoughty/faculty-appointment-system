export default function TableHead({ label }: { label: string }) {
  return (
    <>
      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label}
      </th>
    </>
  );
}
