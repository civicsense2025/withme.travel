import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';
import { motion } from 'framer-motion';

interface IdeasBoardHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IdeasBoardHelpDialog({ open, onOpenChange }: IdeasBoardHelpDialogProps) {
  // Keyboard shortcuts data
  const shortcuts = [
    {
      key: 'D',
      action: 'Add Destination',
      color: 'bg-blue-50',
      textColor: 'text-blue-700',
      emoji: '📍',
    },
    {
      key: 'T',
      action: 'Add Date',
      color: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      emoji: '📅',
    },
    {
      key: 'A',
      action: 'Add Activity',
      color: 'bg-green-50',
      textColor: 'text-green-700',
      emoji: '🏄‍♂️',
    },
    {
      key: 'B',
      action: 'Add Budget',
      color: 'bg-orange-50',
      textColor: 'text-orange-700',
      emoji: '💰',
    },
    {
      key: 'O',
      action: 'Add Other',
      color: 'bg-purple-50',
      textColor: 'text-purple-700',
      emoji: '💭',
    },
  ];

  // Additional utilities
  const utilShortcuts = [
    { key: '/', action: 'Show this help', color: 'bg-gray-50', textColor: 'text-gray-700' },
    { key: 'Esc', action: 'Close dialogs', color: 'bg-gray-50', textColor: 'text-gray-700' },
    {
      key: 'Ctrl+Shift+Enter',
      action: 'Ready for voting',
      color: 'bg-gray-50',
      textColor: 'text-gray-700',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.07,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl bg-gradient-to-b from-white to-gray-50 border border-gray-100 shadow-xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-medium tracking-tight">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <Keyboard className="w-5 h-5 text-gray-600" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              Keyboard Shortcuts
            </motion.span>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-6">
          {/* Main shortcuts table */}
          <motion.div
            className="grid grid-cols-1 gap-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {shortcuts.map((shortcut, index) => (
              <motion.div
                key={shortcut.key}
                className="flex items-center gap-3"
                variants={itemVariants}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02, x: 3 }}
              >
                <motion.div
                  className={`rounded-full w-10 h-10 flex items-center justify-center ${shortcut.color}`}
                  whileHover={{ rotate: [0, -5, 5, -5, 0], transition: { duration: 0.5 } }}
                >
                  <span className="text-lg">{shortcut.emoji}</span>
                </motion.div>
                <div className="flex-1">
                  <div className={`font-medium ${shortcut.textColor}`}>{shortcut.action}</div>
                </div>
                <motion.kbd
                  className={`px-2.5 py-1.5 rounded-xl ${shortcut.color} ${shortcut.textColor} font-mono font-medium text-sm min-w-[28px] text-center`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {shortcut.key}
                </motion.kbd>
              </motion.div>
            ))}
          </motion.div>

          {/* Divider */}
          <motion.div
            className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          ></motion.div>

          {/* Utility shortcuts */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <h3 className="text-sm font-medium text-gray-500">Utilities</h3>
            <div className="grid grid-cols-1 gap-2">
              {utilShortcuts.map((shortcut, index) => (
                <motion.div
                  key={shortcut.key}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.2 }}
                >
                  <span className="text-sm text-gray-600">{shortcut.action}</span>
                  <kbd
                    className={`px-2 py-1 rounded-lg ${shortcut.color} ${shortcut.textColor} font-mono text-xs`}
                  >
                    {shortcut.key}
                  </kbd>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <DialogFooter className="p-6 pt-0 flex justify-end gap-2">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={() => onOpenChange(false)}
              className="rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] px-4"
              autoFocus
            >
              Got it
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
