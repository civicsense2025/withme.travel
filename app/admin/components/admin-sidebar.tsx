'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AdminSidebarProps {
  children: React.ReactNode;
}

export function AdminSidebar({ children }: AdminSidebarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-64 h-screen bg-white/90 dark:bg-black/90 border-r border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-sm shadow-md"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="p-6 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-black"
      >
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
          Admin
        </h2>
        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Management Area</div>
      </motion.div>
      <div className="overflow-y-auto p-1">{children}</div>
    </motion.div>
  );
}
