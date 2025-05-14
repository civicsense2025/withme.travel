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
  const [pollVotes, setPollVotes] = useState(
    pollData.map((p) => ({ ...p, animatedVotes: 0, animatedPercentage: 0 }))
  );

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
        timeoutId = setTimeout(
          () => {
            setVisibleExpenses((prev) => [...prev, expense.id]);
          },
          800 + index * 600
        );
      });

      // Show total with circle animation after expenses
      const totalTimeout = setTimeout(
        () => {
          setShowTotal(true);
          // Then show tooltip
          setTimeout(() => {
            setShowTooltip(true);
          }, 1000);
        },
        800 + expenseData.length * 600 + 500
      );

      return () => {
        clearTimeout(timeoutId);
        clearTimeout(totalTimeout);
      };
    } else if (tab === 'poll') {
      // Reset and animate poll data
      setPollVotes(pollData.map((p) => ({ ...p, animatedVotes: 0, animatedPercentage: 0 })));
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
            const delay = i * 300 + step * (duration / steps);

            setTimeout(() => {
              setPollVotes((prev) =>
                prev.map((p, idx) =>
                  idx === i
                    ? {
                        ...p,
                        animatedVotes: Math.min(p.votes, Math.round(step * increment)),
                        animatedPercentage: Math.min(p.percentage, (p.percentage / steps) * step),
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
  const circlePath =
    'M40,55 C40,15 70,10 110,10 C150,10 180,40 180,80 C180,120 150,140 110,140 C70,140 40,120 40,80';

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col md:flex-row gap-6">
        <div className="w-full overflow-x-auto whitespace-nowrap scrollbar-hide no-scrollbar px-1 md:px-2">
          <TabsList className="flex md:flex-col h-auto space-y-1 md:w-60 flex-shrink-0 border-0">
            {[
              {
                key: 'expenses',
                label: 'Group Expenses',
                icon: <DollarSign className="h-4 w-4 mr-1 text-travel-purple" />,
              },
              {
                key: 'poll',
                label: 'Group Poll',
                icon: <BarChart2 className="h-4 w-4 mr-1 text-travel-purple" />,
              },
            ].map((t) => (
              <TabsTrigger
                key={t.key}
                value={t.key}
                className="flex items-center justify-start px-4 py-3 text-base font-medium w-full data-[state=inactive]:text-muted-foreground"
              >
                {t.icon}
                <span className="ml-2">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

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
                  <Card className="p-5 bg-white dark:bg-black border-2 border-black dark:border-zinc-800 rounded-2xl shadow-md">
                    <p className="text-xs text-muted-foreground mb-4 font-medium">
                      Track and split costs with your group
                    </p>
                    <div className="space-y-2 relative">
                      {expenseData.map((expense, index) => (
                        <motion.div
                          key={expense.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{
                            opacity: visibleExpenses.includes(expense.id) ? 1 : 0,
                            x: visibleExpenses.includes(expense.id) ? 0 : -10,
                          }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-black/20 dark:border-zinc-700 shadow-sm"
                        >
                          <span className="font-medium">
                            {expense.label}{' '}
                            <span className="text-xs text-muted-foreground">
                              (by {expense.payer})
                            </span>
                          </span>
                          <span className="font-bold">${expense.amount.toFixed(2)}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="relative mt-4">
                      <motion.div
                        ref={totalRef}
                        className="flex justify-end items-center p-2 rounded-lg bg-white dark:bg-zinc-900 border border-black/20 dark:border-zinc-700 shadow-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: showTotal ? 1 : 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <span className="text-sm font-bold mr-1">Total:</span>
                        <span className="text-lg font-bold text-travel-purple">
                          ${total.toFixed(2)}
                        </span>
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
                            stroke="var(--color-travel-purple)" /* Use CSS var for theme compatibility */
                            strokeWidth="2"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, ease: 'easeInOut' }}
                            style={{
                              strokeDasharray: 1,
                              strokeDashoffset: 1,
                              strokeLinecap: 'round',
                            }}
                          />
                        </svg>
                      )}

                      {/* Explanatory tooltip */}
                      {showTooltip && (
                        <motion.div
                          ref={tooltipRef}
                          className="absolute -bottom-3 md:top-1/2 md:right-[110%] md:transform md:-translate-y-1/2 bg-black dark:bg-zinc-800 text-white p-2 md:p-3 rounded-lg shadow-xl max-w-[250px] z-10"
                          initial={{ opacity: 0, scale: 0.85, y: showTooltip ? 5 : 0 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                          style={{
                            transformOrigin: 'bottom right',
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-travel-purple flex-shrink-0 mt-1" />
                            <p className="text-xs font-medium">
                              Split this equally? You owe{' '}
                              <span className="font-bold">${(total / 3).toFixed(2)}</span> each!
                            </p>
                          </div>
                          <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 rotate-45 w-4 h-4 bg-black dark:bg-zinc-800 hidden md:block"></div>
                        </motion.div>
                      )}
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
                  <Card className="p-5 bg-white dark:bg-black border-2 border-black dark:border-zinc-800 rounded-2xl shadow-md">
                    <p className="text-xs text-muted-foreground mb-4 font-medium">
                      Vote on destinations, dates, and more
                    </p>
                    <div className="mb-4 font-semibold">Where should we go next?</div>
                    <div className="space-y-3">
                      {pollVotes.map((poll, index) => (
                        <div key={poll.id} className="relative">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="font-medium">{poll.option}</span>
                            <motion.span
                              className="font-bold text-sm"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.3 + 0.5 }}
                            >
                              {poll.animatedVotes} votes
                            </motion.span>
                          </div>
                          <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner border border-black/10 dark:border-zinc-700">
                            <motion.div
                              className="h-full rounded-full bg-travel-purple"
                              initial={{ width: '0%' }}
                              animate={{ width: `${poll.animatedPercentage}%` }}
                              transition={{
                                duration: 1.5,
                                delay: index * 0.3,
                                ease: [0.34, 1.56, 0.64, 1],
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <motion.div
                      className="mt-6 flex justify-end"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.5 }}
                    >
                      <button className="flex items-center gap-1 text-sm font-medium text-travel-purple hover:text-purple-700 dark:hover:text-purple-300 transition-colors group">
                        Cast your vote
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
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
