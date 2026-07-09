type Props = {
    title: string;
    children: React.ReactNode;
  };
  
  export default function FilterSection({
    title,
    children,
  }: Props) {
    return (
      <section className="space-y-4 py-6 border-b border-gray-100 last:border-0">
        <h3 className="text-lg font-semibold text-gray-900">
          {title}
        </h3>
  
        {children}
      </section>
    );
  }