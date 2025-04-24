"use client";
import React, { useState, useEffect } from "react";
export function UrlDisplay() {
    const [origin, setOrigin] = useState('');
    useEffect(() => {
        // Only access window after component mounts to avoid hydration issues
        setOrigin(window.location.origin);
    }, []);
    return (<span className="text-sm text-muted-foreground">{origin}/trips/</span>);
}
