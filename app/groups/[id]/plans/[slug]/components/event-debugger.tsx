import React, { useState, useEffect } from 'react';

export const EventDebugger = () => {
  const [clickTarget, setClickTarget] = useState<string>('None');
  const [lastEvent, setLastEvent] = useState<{ x: number; y: number; target: string } | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Get element details
      const target = e.target as HTMLElement;
      const path = getElementPath(target);

      setClickTarget(path);
      setLastEvent({
        x: e.clientX,
        y: e.clientY,
        target:
          target.tagName +
          (target.className && typeof target.className === 'string'
            ? '.' + target.className.split(' ').join('.')
            : ''),
      });

      // Log to console for more details
      console.log('Click event:', {
        target,
        path,
        event: e,
      });
    };

    // Get CSS path to element
    const getElementPath = (element: HTMLElement): string => {
      if (!element || element === document.body) {
        return 'BODY';
      }

      let selector = element.tagName.toLowerCase();

      if (element.id) {
        selector += '#' + element.id;
      } else if (element.className && typeof element.className === 'string') {
        // Ensure className is a string
        selector += '.' + element.className.split(' ').join('.');
      }

      // Add parent hierarchy up to 3 levels
      let parent = element.parentElement;
      let level = 0;
      let path = selector;

      while (parent && parent !== document.body && level < 3) {
        let parentSelector = parent.tagName.toLowerCase();

        if (parent.id) {
          parentSelector += '#' + parent.id;
        } else if (parent.className && typeof parent.className === 'string') {
          // Ensure className is a string
          parentSelector += '.' + parent.className.split(' ').join('.');
        }

        path = parentSelector + ' > ' + path;
        parent = parent.parentElement;
        level++;
      }

      return path;
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 9999,
        fontSize: '12px',
        maxWidth: '400px',
        pointerEvents: 'none',
      }}
    >
      <div>
        <strong>Last Click Target:</strong>
      </div>
      <div style={{ wordBreak: 'break-all' }}>{clickTarget}</div>
      {lastEvent && (
        <div>
          <div>
            <strong>Position:</strong> {lastEvent.x}, {lastEvent.y}
          </div>
          <div>
            <strong>Element:</strong> {lastEvent.target}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDebugger;
