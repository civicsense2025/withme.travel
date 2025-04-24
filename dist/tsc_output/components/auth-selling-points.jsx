export function AuthSellingPoints() {
    return (<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
      <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg">
        <div className="text-4xl mb-2">✨</div>
        <h3 className="font-medium mb-1">No-frills travel planning</h3>
        <p className="text-sm text-muted-foreground">Simple, clean, and focused on what matters</p>
      </div>
      
      <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg">
        <div className="text-4xl mb-2">👋</div>
        <h3 className="font-medium mb-1">Better with friends</h3>
        <p className="text-sm text-muted-foreground">Collaborate on trips in real-time, hassle-free</p>
      </div>
      
      <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg">
        <div className="text-4xl mb-2">🚀</div>
        <h3 className="font-medium mb-1">Easy to use</h3>
        <p className="text-sm text-muted-foreground">Get started in seconds, plan trips in minutes</p>
      </div>
    </div>);
}
