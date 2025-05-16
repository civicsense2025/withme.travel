interface AuthSellingPointsProps {
  small?: boolean;
}

export function AuthSellingPoints({ small = false }: AuthSellingPointsProps) {
  const emojiClass = small
    ? 'text-lg md:text-2xl mb-1 md:mb-2'
    : 'text-2xl md:text-4xl mb-1 md:mb-2';
  const titleClass = small
    ? 'text-xs md:text-sm font-medium mb-0 md:mb-1'
    : 'text-sm md:text-base font-medium mb-0 md:mb-1';
  const containerClass = small
    ? 'p-2 md:p-3 rounded-lg text-center'
    : 'p-3 md:p-4 rounded-lg text-center';
  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4 text-center mt-0">
      <div className={containerClass}>
        <div className={emojiClass}>✨</div>
        <h3 className={titleClass}>No-frills planning</h3>
      </div>
      <div className={containerClass}>
        <div className={emojiClass}>👋</div>
        <h3 className={titleClass}>Better with friends</h3>
      </div>
      <div className={containerClass}>
        <div className={emojiClass}>🚀</div>
        <h3 className={titleClass}>Easy to use</h3>
      </div>
    </div>
  );
}
