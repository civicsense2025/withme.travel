'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';

interface StateInspectorProps {
  data: any;
  title?: string;
  expanded?: boolean;
  depth?: number;
  maxDepth?: number;
}

/**
 * StateInspector - A component to help debug state by visualizing objects
 */
export function StateInspector({
  data,
  title = 'State Inspector',
  expanded = false,
  depth = 0,
  maxDepth = 3,
}: StateInspectorProps) {
  // State for toggling expanded/collapsed view
  const [isExpanded, setIsExpanded] = useState(expanded);
  // State for visibility
  const [isVisible, setIsVisible] = useState(true);

  // If hidden, show just a button to reveal the inspector
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 bg-gray-100 px-2 py-1 rounded"
      >
        <Eye className="h-3 w-3" />
        <span>Show {title}</span>
      </button>
    );
  }

  // Determine data type
  const type = Array.isArray(data) ? 'array' : typeof data;
  const hasChildren = (type === 'object' || type === 'array') && data !== null;
  const isEmpty = hasChildren && Object.keys(data).length === 0;

  // Render differently based on type
  let content = null;
  let preview = '';

  switch (type) {
    case 'object':
    case 'array':
      if (data === null) {
        preview = 'null';
        content = <span className="text-gray-500">null</span>;
      } else if (isEmpty) {
        preview = type === 'array' ? '[]' : '{}';
        content = <span className="text-gray-500">{preview}</span>;
      } else {
        preview =
          type === 'array'
            ? `Array(${Object.keys(data).length})`
            : `{${Object.keys(data).slice(0, 3).join(', ')}${Object.keys(data).length > 3 ? `...` : ''}}`;

        if (depth < maxDepth) {
          content = (
            <div className="pl-4 border-l border-gray-200 mt-1">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="mt-1">
                  <span className="text-purple-600 mr-1">{key}:</span>
                  <StateInspector
                    data={value}
                    depth={depth + 1}
                    maxDepth={maxDepth}
                    expanded={false}
                  />
                </div>
              ))}
            </div>
          );
        } else {
          content = <span className="text-gray-500">Maximum depth reached</span>;
        }
      }
      break;
    case 'string':
      preview = `"${data.length > 50 ? data.substring(0, 47) + '...' : data}`;
      content = <span className="text-green-600">{preview}</span>;
      break;
    case 'number':
      preview = String(data);
      content = <span className="text-blue-600">{data}</span>;
      break;
    case 'boolean':
      preview = String(data);
      content = <span className="text-orange-600">{String(data)}</span>;
      break;
    case 'function':
      preview = 'ƒ ()';
      content = <span className="text-gray-500">Function</span>;
      break;
    case 'undefined':
      preview = 'undefined';
      content = <span className="text-gray-500">undefined</span>;
      break;
    default:
      preview = String(data);
      content = <span>{String(data)}</span>;
  }

  // Root level component with title
  if (depth === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md shadow-sm p-2 font-mono text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {hasChildren && !isEmpty ? (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mr-1 text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            ) : (
              <span className="w-3 mr-1" />
            )}
            <span className="font-semibold">{title}</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700"
            title="Hide inspector"
          >
            <EyeOff className="h-3 w-3" />
          </button>
        </div>

        {hasChildren && !isEmpty ? (
          isExpanded ? (
            <div className="mt-1">{content}</div>
          ) : (
            <div className="mt-1 text-gray-500">{preview}</div>
          )
        ) : (
          <div className="mt-1">{content}</div>
        )}
      </div>
    );
  }

  // Nested level rendering
  return (
    <span>
      {hasChildren && !isEmpty ? (
        <span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center text-gray-700"
          >
            {!isExpanded && <span className="text-gray-500 mr-1">{preview}</span>}
            {isExpanded ? (
              <ChevronDown className="inline h-3 w-3 ml-1" />
            ) : (
              <ChevronRight className="inline h-3 w-3 ml-1" />
            )}
          </button>
          {isExpanded && <div className="mt-1">{content}</div>}
        </span>
      ) : (
        content
      )}
    </span>
  );
}
