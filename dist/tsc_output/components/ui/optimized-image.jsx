'use client';
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React from 'react';
import Image from 'next/image';
import { imageService } from '@/lib/services/image-service';
export function OptimizedImage(_a) {
    var { metadata = null, type, fallbackText, imageOptions, showAttribution = false, className } = _a, props = __rest(_a, ["metadata", "type", "fallbackText", "imageOptions", "showAttribution", "className"]);
    // Get the optimized image URL with fallback
    const imageUrl = imageService.getImageUrlWithFallback(metadata, type, fallbackText, imageOptions);
    return (<div className="relative">
      <Image src={imageUrl} alt={(metadata === null || metadata === void 0 ? void 0 : metadata.alt_text) || fallbackText} className={className} {...props}/>
      
      {/* Show attribution if requested and available */}
      {showAttribution && (metadata === null || metadata === void 0 ? void 0 : metadata.attribution) && (<div className="absolute bottom-0 right-0 p-1 text-xs text-white/60 bg-black/30 rounded-tl">
          {metadata.attribution}
        </div>)}
    </div>);
}
