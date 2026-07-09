import FilterChip from "./FilterChip";

const roomOptions = [
  "Any",
  "1",
  "2",
  "3",
  "4+",
];

type Props = {
  value: string;
  onChange: (room: string) => void;
};

export default function RoomSelector({
  value,
  onChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {roomOptions.map((room) => (
        <FilterChip
          key={room}
          label={room}
          active={value === room}
          onClick={() => onChange(room)}
        />
      ))}
    </div>
  );
}