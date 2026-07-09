type Props = {
    label: string;
    active: boolean;
    onClick: () => void;
  };
  
  export default function FilterChip({
    label,
    active,
    onClick,
  }: Props) {
    return (
      <button
        onClick={onClick}
        className={`
          px-4 py-2 rounded-full
          text-sm font-medium
          transition-all duration-200
  
          ${
            active
              ? "bg-[#ff5a5f] text-white shadow-lg shadow-[#ff5a5f]/25"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }
        `}
      >
        {label}
      </button>
    );
  }