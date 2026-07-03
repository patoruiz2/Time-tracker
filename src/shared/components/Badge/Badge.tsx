export const Badge = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <span className={`badge ${className}`.trim()}>{children}</span>;
