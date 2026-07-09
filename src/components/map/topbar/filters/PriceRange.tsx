type Props = {
    min: string;
    max: string;
    onMinChange: (v: string) => void;
    onMaxChange: (v: string) => void;
  };
  
  export default function PriceRange({
    min,
    max,
    onMinChange,
    onMaxChange,
  }: Props) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Min Price"
          value={min}
          onChange={(e) =>
            onMinChange(e.target.value)
          }
          className="
            rounded-2xl
            border
            border-gray-200
            p-4
          "
        />
  
        <input
          type="number"
          placeholder="Max Price"
          value={max}
          onChange={(e) =>
            onMaxChange(e.target.value)
          }
          className="
            rounded-2xl
            border
            border-gray-200
            p-4
          "
        />
      </div>
    );
  }
  