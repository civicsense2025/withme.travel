import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { DollarSign, BarChart2, AlertCircle, ArrowRight } from 'lucide-react';

// Expense data
const expenseData = [
  { id: 'e1', label: 'Hotel', amount: 1200, payer: 'Alex' },
  { id: 'e2', label: 'Tapas Dinner', amount: 180, payer: 'Jamie' },
  { id: 'e3', label: 'Beach Umbrella', amount: 40, payer: 'Taylor' },
];

// Poll data
const pollData = [
  { id: 'p1', option: 'Barcelona, Spain', votes: 5, percentage: 70 },
  { id: 'p2', option: 'Rome, Italy', votes: 2, percentage: 30 },
  { id: 'p3', option: 'Paris, France', votes: 1, percentage: 15 },
];

export function FeatureTabs() {
  const [tab, setTab] = useState('expenses');
  const [visibleExpenses, setVisibleExpenses] = useState<string[]>([]);
  const [showTotal, setShowTotal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [animatingPoll, setAnimatingPoll] = useState(false);
  const [pollVotes, setPollVotes] = useState(pollData.map(p => ({ ...p, animatedVotes: 0, animatedPercentage: 0 })));
  
  const circleRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const totalRef = useRef<HTMLDivElement>(null);
  const expensesControls = useAnimation();
  const pollControls = useAnimation();
  
  // Calculate total for expenses
  const total = expenseData.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Handle tab change
  useEffect(() => {
    if (tab === 'expenses') {
      // Reset states for expenses tab
      setVisibleExpenses([]);
      setShowTotal(false);
      setShowTooltip(false);
      
      // Animate in expenses one by one
      let timeoutId: NodeJS.Timeout;
      expenseData.forEach((expense, index) => {
        timeoutId = setTimeout(() => {
          setVisibleExpenses(prev => [...prev, expense.id]);
        }, 800 + index * 600);
      });
      
      // Show total with circle animation after expenses
      const totalTimeout = setTimeout(() => {
        setShowTotal(true);
        // Then show tooltip
        setTimeout(() => {
          setShowTooltip(true);
        }, 1000);
      }, 800 + expenseData.length * 600 + 500);
      
      return () => {
        clearTimeout(timeoutId);
        clearTimeout(totalTimeout);
      };
    } else if (tab === 'poll') {
      // Reset and animate poll data
      setPollVotes(pollData.map(p => ({ ...p, animatedVotes: 0, animatedPercentage: 0 })));
      setAnimatingPoll(true);
      
      // Animate votes and bars
      const animatePolls = async () => {
        for (let i = 0; i < pollData.length; i++) {
          const poll = pollData[i];
          
          // Animate votes count
          const duration = 1500; // ms
          const steps = 20;
          const increment = poll.votes / steps;
          
          for (let step = 1; step <= steps; step++) {
            const delay = (i * 300) + (step * (duration / steps));
            
            setTimeout(() => {
              setPollVotes(prev => 
                prev.map((p, idx) => 
                  idx === i 
                    ? { 
                        ...p, 
                        animatedVotes: Math.min(p.votes, Math.round(step * increment)),
                        animatedPercentage: Math.min(p.percentage, (p.percentage / steps) * step)
                      } 
                    : p
                )
              );
            }, delay);
          }
        }
      };
      
      animatePolls();
      return () => {
        setAnimatingPoll(false);
      };
    }
  }, [tab]);
  
  // SVG path for the circle animation
  const circlePath = "M40,55 C40,15 70,10 110,10 C150,10 180,40 180,80 C180,120 150,140 110,140 C70,140 40,120 40,80";

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col md:flex-row gap-6">
        <TabsList className="flex md:flex-col h-auto bg-transparent p-0 space-y-1 md:w-60 flex-shrink-0">
          {[
            { key: 'expenses', label: 'Group Expenses', icon: <DollarSign className="h-4 w-4 mr-1 text-blue-500" /> },
            { key: 'poll', label: 'Group Poll', icon: <BarChart2 className="h-4 w-4 mr-1 text-blue-400" /> }
          ].map((t) => (
            <TabsTrigger
              key={t.key}
              value={t.key}
              className={
                `flex items-center justify-start px-4 py-3 rounded-xl font-medium text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full
                ${t.key === 'expenses' ?
                  'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-100 data-[state=active]:to-cyan-50 data-[state=active]:text-blue-900 hover:bg-blue-50' :
                  'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-100 data-[state=active]:to-teal-50 data-[state=active]:text-blue-900 hover:bg-blue-50'}
                data-[state=inactive]:text-muted-foreground`
              }
            >
              {t.icon}
              <span className="ml-2">{t.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <div className="relative flex-1 min-h-[340px] flex items-stretch">
          <AnimatePresence mode="wait" initial={false}>
            {tab === 'expenses' && (
              <TabsContent key="expenses" value="expenses" forceMount className="w-full mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25, type: 'spring', bounce: 0.2 }}
                  className="relative"
                >
                  <Card className="p-5 bg-gradient-to-br from-blue-100/80 to-cyan-50/80 backdrop-blur-sm rounded-2xl shadow-md border border-blue-100">
                    <p className="text-xs text-muted-foreground mb-4 font-medium">Track and split costs with your group</p>
                    <div className="space-y-2 relative">
                      {expenseData.map((expense, index) => (
                        <motion.div
                          key={expense.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ 
                            opacity: visibleExpenses.includes(expense.id) ? 1 : 0,
                            x: visibleExpenses.includes(expense.id) ? 0 : -10
                          }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-white/70 backdrop-blur-sm shadow-sm"
                        >
                          <span className="font-medium">{expense.label} <span className="text-xs text-muted-foreground">(by {expense.payer})</span></span>
                          <span className="font-bold">${expense.amount.toFixed(2)}</span>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="relative mt-4">
                      <motion.div 
                        ref={totalRef}
                        className="flex justify-end items-center p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: showTotal ? 1 : 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <span className="text-sm font-bold mr-1">Total:</span>
                        <span className="text-lg font-bold text-teal-700">${total.toFixed(2)}</span>
                      </motion.div>
                      
                      {/* Circle animation */}
                      {showTotal && (
                        <svg
                          ref={circleRef}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none"
                          style={{ width: '100%', height: '120%', overflow: 'visible' }}
                        >
                          <motion.path
                            d={circlePath}
                            stroke="#0d9488" /* teal-600 */
                            strokeWidth="2"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            style={{ 
                              strokeDasharray: 1,
                              strokeDashoffset: 1,
                              strokeLinecap: "round"
                            }}
                          />
                        </svg>
                      )}
                      
                      {/* Settle up tooltip */}
                      <motion.div
                        ref={tooltipRef}
                        className="absolute top-full right-0 mt-2 p-2 bg-blue-600 text-white text-xs font-medium rounded-lg shadow-lg z-10 flex items-center"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ 
                          opacity: showTooltip ? 1 : 0,
                          y: showTooltip ? 0 : -5
                        }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <span>Tap to settle up</span>
                        <ArrowRight className="h-3 w-3 ml-1" />
                        <motion.div
                          className="absolute w-2 h-2 bg-blue-600 rotate-45 top-0 right-4 -translate-y-1/2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: showTooltip ? 1 : 0 }}
                        />
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              </TabsContent>
            )}
            
            {tab === 'poll' && (
              <TabsContent key="poll" value="poll" forceMount className="w-full mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25, type: 'spring', bounce: 0.2 }}
                >
                  <Card className="p-5 bg-gradient-to-br from-blue-100/80 to-teal-50/80 backdrop-blur-sm rounded-2xl shadow-md border border-blue-100">
                    <p className="text-xs text-muted-foreground mb-4 font-medium">Vote on destinations, dates, and more</p>
                    <div className="mb-4 font-semibold">Where should we go next?</div>
                    <div className="space-y-3">
                      {pollVotes.map((poll, index) => (
                        <div key={poll.id} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{poll.option}</span>
                            <motion.span 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="ml-2 text-xs text-muted-foreground flex items-center"
                            >
                              <motion.span>{poll.animatedVotes}</motion.span>
                              <span className="ml-1">vote{poll.animatedVotes !== 1 ? 's' : ''}</span>
                            </motion.span>
                          </div>
                          <div className="relative h-2 rounded-full bg-blue-100 overflow-hidden">
                            <motion.div 
                              className="absolute left-0 top-0 h-full rounded-full bg-teal-400"
                              initial={{ width: '0%' }}
                              animate={{ width: `${poll.animatedPercentage}%` }}
                              transition={{ duration: 1, delay: index * 0.2, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Vote animation indicator */}
                    <motion.div 
                      className="mt-4 flex items-center justify-center text-xs text-teal-600 font-medium bg-teal-50 p-2 rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2 }}
                    >
                      <span>✓ 8 members have voted</span>
                    </motion.div>
                  </Card>
                </motion.div>
              </TabsContent>
            )}
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  );
}

export default FeatureTabs; 