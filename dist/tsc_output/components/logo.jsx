import React from "react";
export function Logo({ className = "" }) {
    return (<span className={`flex items-center gap-1 ${className}`}>
      <span className="text-xl font-bold gradient-text">🤝 withme.travel</span>
    </span>);
}
