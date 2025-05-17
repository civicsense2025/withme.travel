'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Calendar, Clock, MapPin, Users } from 'lucide-react';

// ============================================================================
// STREAMLINED ANIMATED EXPENSE SPLITTING DEMO
// ============================================================================

const users = [
  { name: 'Tina', emoji: '🦄', color: 'bg-pink-200', textColor: 'text-pink-600', shadowColor: 'shadow-pink-200/50', fallback: 'TI' },
  { name: 'June', emoji: '🐙', color: 'bg-purple-200', textColor: 'text-purple-600', shadowColor: 'shadow-purple-200/50', fallback: 'JU' },
  { name: 'Jay', emoji: '🦁', color: 'bg-yellow-200', textColor: 'text-yellow-600', shadowColor: 'shadow-yellow-200/50', fallback: 'JA' },
  { name: 'Christopher', emoji: '🐧', color: 'bg-blue-200', textColor: 'text-blue-600', shadowColor: 'shadow-blue-200/50', fallback: 'CH' },
];

const scenarios = [
  {
    id: 'dinner',
    activity: 'Dinner in Rome',
    emoji: '🍝',
    location: 'Trattoria da Luigi',
    paidBy: 0, // Tina
    amount: 220, // More realistic for a nice dinner for 4 in Rome
    split: true,
    shares: [0.25, 0.25, 0.25, 0.25], // Equal split
  },
  {
    id: 'museum',
    activity: 'Museum Tickets',
    emoji: '🖼️',
    location: 'Florence',
    paidBy: 1, // June
    amount: 120, // More realistic for museum tickets for 4 people
    split: true,
    shares: [0.25, 0.25, 0.25, 0.25], // Equal split
  },
  {
    id: 'kayak',
    activity: 'Kayak Tour',
    emoji: '🚣‍♂️',
    location: 'Lake Como',
    paidBy: 2, // Jay
    amount: 40, // More realistic for a kayak tour for 4
    split: false, // "It's on me!"
    shares: [0, 0, 1, 0], // Jay pays for everyone
  }
];

// Summary of the whole trip for the final phase - updated with more expenses and realistic pricing
const tripSummary = {
  title: "Italian Adventure",
  duration: "5 days",
  totalSpent: 1780, // Updated total
  expenses: [
    { activity: "Dinner", amount: 240, paidBy: "Tina" },
    { activity: "Museum", amount: 80, paidBy: "June" },
    { activity: "Kayak Tour", amount: 320, paidBy: "Jay" },
    // No need to add all 23 expenses, we'll mention them in the UI
  ],
  otherExpensesCount: 23, // Added to show in summary
  participants: 4
};

export function ExpenseMarketingSection() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [animationPlaying, setAnimationPlaying] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const scenario = scenarios[activeScenario];
  
  // Refs for positioning money flow animations
  const avatarRefs = useRef<Array<HTMLDivElement | null>>(Array(users.length).fill(null));
  
  // Intersection Observer to detect when the section is in view
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // When section comes into view, start animations if not already playing
        if (entry.isIntersecting && !animationPlaying) {
          setAnimationPlaying(true);
          setAnimationPhase(0);
        }
        // Optionally, pause/reset when scrolling out of view
        if (!entry.isIntersecting && animationPlaying) {
          // Here we choose to keep the current state when scrolling away
          // If you want to reset: setAnimationPlaying(false);
        }
      },
      { threshold: 0.25 } // Trigger when 25% of the section is visible
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [animationPlaying]);
  
  // Animation control timeline - only runs when animationPlaying is true
  useEffect(() => {
    if (!animationPlaying) return;

    let timeout: NodeJS.Timeout;
    
    // Longer pauses between phases for better readability
    const phaseDelays = [
      2000, // Phase 0 → 1
      2500, // Phase 1 → 2
      3000, // Phase 2 → 3
      3500, // Phase 3 → 4
      4000, // Phase 4 → next scenario or summary
    ];
    
    if (animationPhase < 4) {
      // Progress through phases 0-3 of the current scenario
      timeout = setTimeout(() => {
        setAnimationPhase(prev => prev + 1);
      }, phaseDelays[animationPhase]);
    } else if (animationPhase === 4) {
      // At phase 4 ("All settled up"), wait then move to next scenario
      timeout = setTimeout(() => {
        // If we're at the last scenario, show the summary
        if (activeScenario === scenarios.length - 1) {
          setSummaryVisible(true);
          setAnimationPhase(5); // Move to phase 5 (summary phase)
        } else {
          // Otherwise move to the next scenario
          setActiveScenario(prev => prev + 1);
          setAnimationPhase(0);
        }
      }, phaseDelays[animationPhase]);
    } else {
      // We're in the summary phase (5) - restart the whole animation after delay
      timeout = setTimeout(() => {
        setActiveScenario(0);
        setAnimationPhase(0);
        setSummaryVisible(false);
      }, 8000);
    }
    
    return () => clearTimeout(timeout);
  }, [animationPhase, activeScenario, animationPlaying]);
  
  // Calculate individual amounts
  const getAmount = (userIndex: number) => {
    if (!scenario.split) return 0; // "It's on me" scenario
    return Math.round(scenario.amount * scenario.shares[userIndex]);
  };
  
  // Special case for "It's on me"
  const isItsOnMe = scenario.id === 'kayak' && animationPhase >= 1;

  return (
    <section ref={sectionRef} className="py-16 px-4 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Component First on Mobile, Second on Desktop */}
        <div className="order-1 md:order-2">
          <div className="bg-card rounded-4xl shadow-xl border border-border p-5 sm:p-8 max-w-md mx-auto w-full h-[400px] sm:h-[480px] md:h-[520px] flex flex-col justify-center items-center relative overflow-hidden">
            {/* Trip Activity Header */}
            <AnimatePresence mode="wait">
              {!summaryVisible && (
                <motion.div 
                  key={`activity-${scenario.id}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-5 sm:top-8 left-0 w-full px-5 sm:px-8 text-center"
                >
                  <span className="text-3xl sm:text-4xl mb-2 sm:mb-3 inline-block">{scenario.emoji}</span>
                  <h3 className="text-lg sm:text-xl font-bold">{scenario.activity}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">{scenario.location}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Main Content Area - improve centering and mobile scaling */}
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              {/* Animated Avatars Circle - reduce size on smaller screens */}
              <AnimatePresence>
                {!summaryVisible && (
                  <motion.div 
                    className="w-full max-w-[280px] h-[280px] relative mt-12 mx-auto flex items-center justify-center"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {users.map((user, index) => {
                      // Position avatars in a circle
                      const angle = (index * (Math.PI * 2)) / users.length;
                      const radius = 100; // slightly smaller than half of container width
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;
                      
                      // For the payer, we want them to be highlighted
                      const isPayer = index === scenario.paidBy;
                      
                      return (
                        <motion.div
                          key={`avatar-${user.name}`}
                          ref={(el: HTMLDivElement | null) => {
                            avatarRefs.current[index] = el;
                          }}
                          className={`absolute ${user.shadowColor} shadow-lg rounded-full`}
                          style={{
                            left: `calc(50% + ${x}px)`,
                            top: `calc(50% + ${y}px)`,
                            transform: "translate(-50%, -50%)"
                          }}
                          initial={false}
                          animate={{
                            scale: isPayer && animationPhase >= 1 ? 1.15 : 1,
                            zIndex: isPayer && animationPhase >= 1 ? 10 : 1,
                          }}
                        >
                          {/* Avatar */}
                          <div className={`relative`}>
                            <div 
                              className={`
                                h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl
                                font-bold ${user.color} border
                                ${isPayer && animationPhase >= 1 ? 'ring-4 ring-green-400 border-green-300' : ''}
                              `}
                            >
                              {user.emoji}
                            </div>
                            
                            {/* User Name */}
                            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-center">
                              <span className={`text-xs sm:text-sm font-medium ${isPayer ? user.textColor : ''}`}>
                                {user.name} {isPayer && animationPhase >= 1 && !isItsOnMe && <span className="text-xs">(paid)</span>}
                              </span>
                            </div>
                            
                            {/* Expense Amount (only shows for payer when revealed) - make smaller font, wider bubble */}
                            {isPayer && animationPhase >= 1 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className={`absolute -top-8 left-1/2 transform -translate-x-1/2 
                                  px-4 py-1 bg-white/90 ${user.textColor} text-xs font-semibold rounded-full 
                                  shadow-sm border border-gray-100 z-10 min-w-[60px] text-center`}
                              >
                                {isItsOnMe ? "It's on me!" : `$${scenario.amount}`}
                              </motion.div>
                            )}
                            
                            {/* Owed Amount (for non-payers, phase 2+) - make smaller font, wider bubble */}
                            {!isPayer && animationPhase >= 2 && !isItsOnMe && getAmount(index) > 0 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + index * 0.15 }}
                                className={`absolute -top-8 left-1/2 transform -translate-x-1/2 
                                  px-4 py-1 bg-white/90 text-xs font-semibold rounded-full 
                                  shadow-sm border border-gray-100 text-red-500 z-10 min-w-[60px] text-center`}
                              >
                                -${getAmount(index)}
                              </motion.div>
                            )}
                            
                            {/* Thank You Button (only for Jay's "It's on me" scenario) */}
                            {isItsOnMe && isPayer && animationPhase >= 2 && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                              >
                                <Button size="sm" className="rounded-full px-4 py-1 text-xs flex items-center gap-1 bg-pink-100 text-pink-600 hover:bg-pink-200">
                                  <span role="img" aria-label="heart">❤️</span> Thank Jay
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                    
                    {/* Money Flow Animations (Phase 3) - ensure properly centered */}
                    {animationPhase >= 3 && !isItsOnMe && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        {users.map((user, index) => {
                          if (index === scenario.paidBy) return null; // Skip payer
                          return (
                            <motion.div
                              key={`flow-${user.name}`}
                              className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center"
                              initial="hidden"
                              animate="visible"
                              transition={{ delay: index * 0.2 }}
                              variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1 }
                              }}
                            >
                              {/* Draw path from user to payer - ensure properly centered */}
                              <svg className="absolute inset-0 w-full h-full">
                                <motion.path
                                  d={`M ${140 + Math.cos((index * (Math.PI * 2)) / users.length) * 100} 
                                    ${140 + Math.sin((index * (Math.PI * 2)) / users.length) * 100} 
                                    L ${140 + Math.cos((scenario.paidBy * (Math.PI * 2)) / users.length) * 100} 
                                    ${140 + Math.sin((scenario.paidBy * (Math.PI * 2)) / users.length) * 100}`}
                                  stroke={user.textColor.replace('text-', 'var(--')}
                                  strokeWidth="2"
                                  fill="none"
                                  strokeDasharray="6,6"
                                  initial={{ pathLength: 0, opacity: 0 }}
                                  animate={{ pathLength: 1, opacity: 0.6 }}
                                  transition={{ duration: 1, delay: index * 0.2 }}
                                />
                                
                                {/* Animate a small coin along the path */}
                                <motion.circle
                                  cx="0"
                                  cy="0"
                                  r="8"
                                  fill="white"
                                  stroke="#ddd"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: index * 0.2 + 0.2 }}
                                >
                                  <animateMotion
                                    path={`M ${140 + Math.cos((index * (Math.PI * 2)) / users.length) * 100} 
                                      ${140 + Math.sin((index * (Math.PI * 2)) / users.length) * 100} 
                                      L ${140 + Math.cos((scenario.paidBy * (Math.PI * 2)) / users.length) * 100} 
                                      ${140 + Math.sin((scenario.paidBy * (Math.PI * 2)) / users.length) * 100}`}
                                    dur="1s"
                                    fill="freeze"
                                    begin={`${index * 0.2 + 0.2}s`}
                                  />
                                  <motion.text
                                    x="0"
                                    y="3"
                                    textAnchor="middle"
                                    fontSize="10"
                                    fontWeight="bold"
                                    fill="currentColor"
                                    className="text-yellow-600"
                                  >
                                    $
                                  </motion.text>
                                </motion.circle>
                              </svg>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* "All Settled" message (Phase 4) */}
              <AnimatePresence>
                {/* Remove the "All Settled" message during individual scenarios - only show in summary */}
                {false && animationPhase >= 4 && !summaryVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 text-center"
                  >
                    <div className="text-green-500 font-semibold text-lg mb-2">
                      {isItsOnMe ? "Everyone enjoyed the treat!" : "All settled up!"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isItsOnMe ? "No one owes anything. Jay covered it all!" : "Everyone paid their fair share."}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Trip Summary (Final Phase) */}
              <AnimatePresence>
                {summaryVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="w-full px-4 flex flex-col items-center"
                  >
                    <h3 className="text-2xl font-bold mb-4 text-center">{tripSummary.title}</h3>
                    
                    {/* Trip stats */}
                    <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-6">
                      <div className="bg-muted/40 rounded-lg p-3 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Duration</div>
                          <div className="font-medium">{tripSummary.duration}</div>
                        </div>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-3 flex items-center gap-2">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">People</div>
                          <div className="font-medium">{tripSummary.participants}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expense Summary */}
                    <div className="w-full max-w-xs bg-background rounded-xl border border-border p-4 mb-6">
                      <h4 className="text-sm font-semibold mb-2 flex items-center justify-between">
                        <span>Expense Summary</span>
                        <span className="text-right text-green-600">${tripSummary.totalSpent}</span>
                      </h4>
                      <div className="space-y-2">
                        {tripSummary.expenses.map((expense, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-lg
                                font-bold ${users.find(u => u.name === expense.paidBy)?.color || 'bg-gray-200'}`}
                              >
                                {users.find(u => u.name === expense.paidBy)?.emoji || '👤'}
                              </div>
                              <span>{expense.activity}</span>
                            </div>
                            <span>${expense.amount}</span>
                          </div>
                        ))}
                        {/* Add the "other expenses" row */}
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full flex items-center justify-center text-lg font-bold bg-muted/50">
                              ⋯
                            </div>
                            <span>and {tripSummary.otherExpensesCount} other expenses...</span>
                          </div>
                          <span>$600</span>
                        </div>
                      </div>
                      
                      {/* All settled up message - moved here from individual scenarios */}
                      <div className="mt-4 pt-3 border-t border-border text-center">
                        <div className="text-green-500 font-semibold">All settled up!</div>
                        <div className="text-xs text-muted-foreground">Everyone paid their fair share.</div>
                      </div>
                    </div>
                    
                    {/* CTA Button */}
                    <Button className="w-full max-w-xs">
                      Plan Your Trip
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* Marketing Copy - Second on Mobile, First on Desktop */}
        <div className="order-2 md:order-1 flex flex-col justify-center h-full">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Group expenses, made easy</h2>
          <p className="text-lg text-muted-foreground mb-6">
            With withme.travel, you can track every shared cost, see who paid for what, and split expenses fairly—no spreadsheets, no drama. Settle up in seconds and keep your friendships strong.
          </p>
          <Button size="lg" asChild className="self-start">
            <a href="#get-started">See how it works</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default ExpenseMarketingSection; 