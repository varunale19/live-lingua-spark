export function FlagUS({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 21 15" className={`h-4 w-[21px] rounded-[3px] ${className}`} aria-hidden>
      <rect width="21" height="15" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((y) => (
        <rect key={y} y={y * (15 / 13)} width="21" height={15 / 13} fill="#D62B3A" />
      ))}
      <rect width="9" height={(15 / 13) * 7} fill="#2A3560" />
    </svg>
  );
}

export function FlagDE({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 21 15" className={`h-4 w-[21px] rounded-[3px] ${className}`} aria-hidden>
      <rect width="21" height="5" fill="#1A1A1A" />
      <rect y="5" width="21" height="5" fill="#D62B3A" />
      <rect y="10" width="21" height="5" fill="#F2C230" />
    </svg>
  );
}