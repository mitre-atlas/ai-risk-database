/**
 * Two column list for displaying a set of properties
 */
export const TwoColumnsList = ({
  items,
}: {
  items: { name: React.ReactNode; value: React.ReactNode }[];
}) => {
  return (
    <div className="w-full">
      {items.map(({ name, value }, index) => (
        <div key={index} className="flex justify-between">
          <div className="w-1/2">{name}</div>
          <div className="w-1/2">{value}</div>
        </div>
      ))}
    </div>
  );
};
