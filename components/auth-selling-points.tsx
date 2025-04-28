export function AuthSellingPoints() {
  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4 text-center">
      <div className="bg-gradient-to-br from-card/50 to-black/50 dark:from-card/30 dark:to-black/60 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-border/10 dark:border-border/5">
        <div className="text-2xl md:text-4xl mb-1 md:mb-2">✨</div>
        <h3 className="text-sm md:text-base font-medium mb-0 md:mb-1">No-frills planning</h3>
        <p className="hidden md:block text-xs text-muted-foreground">Simple tools, clean interface</p>
      </div>
      
      <div className="bg-gradient-to-br from-card/50 to-black/50 dark:from-card/30 dark:to-black/60 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-border/10 dark:border-border/5">
        <div className="text-2xl md:text-4xl mb-1 md:mb-2">👋</div>
        <h3 className="text-sm md:text-base font-medium mb-0 md:mb-1">Better with friends</h3>
        <p className="hidden md:block text-xs text-muted-foreground">Collaborate in real-time</p>
      </div>
      
      <div className="bg-gradient-to-br from-card/50 to-black/50 dark:from-card/30 dark:to-black/60 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-border/10 dark:border-border/5">
        <div className="text-2xl md:text-4xl mb-1 md:mb-2">🚀</div>
        <h3 className="text-sm md:text-base font-medium mb-0 md:mb-1">Easy to use</h3>
        <p className="hidden md:block text-xs text-muted-foreground">Start planning in seconds</p>
      </div>
    </div>
  )
} 