
export function ComparisonLayout({ 
  children, 
  title 
}: { 
  children: React.ReactNode; 
  title: string; 
}) {
  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-xl font-medium mb-4 text-gray-700">
        {title}
      </h3>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
