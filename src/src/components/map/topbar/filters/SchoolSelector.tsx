import { schools } from "@/lib/schools";

type Props = {
  value: string;
  onChange: (school: string) => void;
};

export default function SchoolSelector({
  value,
  onChange,
}: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-4
        outline-none
        focus:border-[#ff5a5f]
      "
    >
      <option value="">Any School</option>

      {schools.map((school) => (
        <option
          key={school.key}
          value={school.name}
        >
          {school.name}
        </option>
      ))}
    </select>
  );
}