'use client';

import React from 'react';
import { useWhiteboard } from '../context/whiteboard-context';
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Grid, 
  Plus, 
  Filter, 
  Users,
  Save,
  MoreHorizontal,
  Image,
  Trash2,
  Layout,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WhiteboardControlsProps {
  onAddIdea: () => void;
  onToggleCollaborators: () => void;
  onToggleFilter: () => void;
  onSaveBoard: () => void;
  onExportImage?: () => void;
  onClearAll?: () => void;
  onAutoArrange?: () => void;
  onToggleCursors: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  isCollaboratorsVisible: boolean;
  isFilterVisible: boolean;
  isCursorsVisible: boolean;
  activeUsers: number;
}

export function WhiteboardControls({
  onAddIdea,
  onToggleCollaborators,
  onToggleFilter,
  onSaveBoard,
  onExportImage,
  onClearAll,
  onAutoArrange,
  onToggleCursors,
  onZoomIn,
  onZoomOut,
  isCollaboratorsVisible,
  isFilterVisible,
  isCursorsVisible,
  activeUsers = 0
}: WhiteboardControlsProps) {
  const {
    zoomIn: contextZoomIn,
    zoomOut: contextZoomOut,
    resetView,
    view,
    showGrid,
    setShowGrid
  } = useWhiteboard();

  // Use the passed handlers if available, fall back to context
  const handleZoomIn = onZoomIn || contextZoomIn;
  const handleZoomOut = onZoomOut || contextZoomOut;

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-background/90 backdrop-blur-sm p-1.5 rounded-lg shadow-md border border-border">
      {/* Add idea button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onAddIdea}
              className="h-8 w-8 rounded-full text-foreground hover:bg-muted transition-colors"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">Add idea</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Add spacer */}
      <div className="h-6 border-l border-border/50"></div>

      {/* Zoom controls */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              className="h-8 w-8 rounded-full text-foreground hover:bg-muted transition-colors"
              disabled={view.scale <= 0.2}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">Zoom out</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetView}
              className="h-8 w-8 rounded-full text-foreground hover:bg-muted transition-colors"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">Reset view</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              className="h-8 w-8 rounded-full text-foreground hover:bg-muted transition-colors"
              disabled={view.scale >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">Zoom in</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Add spacer */}
      <div className="h-6 border-l border-border/50"></div>

      {/* Grid toggle */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showGrid ? "default" : "ghost"}
              size="icon"
              onClick={() => setShowGrid(!showGrid)}
              className={`h-8 w-8 rounded-full hover:bg-muted transition-colors ${
                showGrid ? 'bg-primary text-primary-foreground' : 'text-foreground'
              }`}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">{showGrid ? 'Hide grid' : 'Show grid'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Show/hide cursors */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isCursorsVisible ? "default" : "ghost"}
              size="icon"
              onClick={onToggleCursors}
              className={`h-8 w-8 rounded-full hover:bg-muted transition-colors ${
                isCursorsVisible ? 'bg-primary text-primary-foreground' : 'text-foreground'
              }`}
            >
              {isCursorsVisible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">{isCursorsVisible ? 'Hide cursors' : 'Show cursors'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Add spacer */}
      <div className="h-6 border-l border-border/50"></div>

      {/* Save button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSaveBoard}
              className="h-8 w-8 rounded-full text-foreground hover:bg-muted transition-colors"
            >
              <Save className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">Save board</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* More options dropdown */}
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-foreground hover:bg-muted transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">More options</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
          {onExportImage && (
            <DropdownMenuItem onClick={onExportImage} className="text-xs flex items-center gap-2">
              <Image className="h-4 w-4" />
              Export as image
            </DropdownMenuItem>
          )}
          {onAutoArrange && (
            <DropdownMenuItem onClick={onAutoArrange} className="text-xs flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Auto arrange
            </DropdownMenuItem>
          )}
          {onClearAll && (
            <DropdownMenuItem onClick={onClearAll} className="text-destructive text-xs flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Clear all
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Show/hide collaborators */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isCollaboratorsVisible ? "default" : "ghost"}
              size="icon"
              onClick={onToggleCollaborators}
              className={`h-8 w-8 rounded-full hover:bg-muted transition-colors relative ${
                isCollaboratorsVisible ? 'bg-primary text-primary-foreground' : 'text-foreground'
              }`}
            >
              <Users className="h-4 w-4" />
              {activeUsers > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                  {activeUsers}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">{isCollaboratorsVisible ? 'Hide collaborators' : 'Show collaborators'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Show/hide filter */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isFilterVisible ? "default" : "ghost"}
              size="icon"
              onClick={onToggleFilter}
              className={`h-8 w-8 rounded-full hover:bg-muted transition-colors ${
                isFilterVisible ? 'bg-primary text-primary-foreground' : 'text-foreground'
              }`}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">{isFilterVisible ? 'Hide filter' : 'Show filter'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
} 