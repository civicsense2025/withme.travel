import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { DollarSign, BarChart2 } from 'lucide-react';

const tabData = [
  {
    key: 'expenses',
    label: 'Group Expenses',
    icon: <DollarSign className="mr-2 h-5 w-5 text-green-500" />,
    content: (
      <Card className="p-8 bg-gradient-to-br from-green-100 to-blue-50 rounded-2xl shadow-xl">

        <p className="text-muted-foreground mb-6">Track and split costs with your group. Settle up after.</p>
        <div className="space-y-2">
          <div className="flex justify-between"><span>Hotel <span className="text-xs text-muted-foreground">(by Alex)</span></span><span className="font-bold">$1200.00</span></div>
          <div className="flex justify-between"><span>Tapas Dinner <span className="text-xs text-muted-foreground">(by Jamie)</span></span><span className="font-bold">$180.00</span></div>
          <div className="flex justify-between"><span>Beach Umbrella <span className="text-xs text-muted-foreground">(by Taylor)</span></span><span className="font-bold">$40.00</span></div>
        </div>
        <div className="flex justify-end mt-4 text-lg font-bold">Total: $1420.00</div>
      </Card>
    ),
  },
  {
    key: 'poll',
    label: 'Group Poll',
    icon: <BarChart2 className="mr-2 h-5 w-5 text-purple-500" />,
    content: (
      <Card className="p-8 bg-gradient-to-br from-purple-100 to-pink-50 rounded-2xl shadow-xl">

        <p className="text-muted-foreground mb-6">Vote on destinations, dates, and more.</p>
        <div className="mb-4 font-semibold">Where should we go next?</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold">Barcelona, Spain</span>
            <span className="ml-2 text-xs text-muted-foreground">5 votes</span>
          </div>
          <motion.div layout className="h-2 rounded bg-purple-300 mb-2" style={{ width: '70%' }} />
          <div className="flex items-center justify-between">
            <span className="font-bold">Rome, Italy</span>
            <span className="ml-2 text-xs text-muted-foreground">2 votes</span>
          </div>
          <motion.div layout className="h-2 rounded bg-purple-200 mb-2" style={{ width: '30%' }} />
          <div className="flex items-center justify-between">
            <span className="font-bold">Paris, France</span>
            <span className="ml-2 text-xs text-muted-foreground">1 vote</span>
          </div>
          <motion.div layout className="h-2 rounded bg-purple-100" style={{ width: '15%' }} />
        </div>
      </Card>
    ),
  },
];

export function FeatureTabs() {
  const [tab, setTab] = React.useState(tabData[0].key);

  return (
    <div className="w-full max-w-2xl mx-auto py-12">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="flex bg-white rounded-full shadow-md p-1 mb-8 gap-2">
          {tabData.map((t) => (
            <TabsTrigger
              key={t.key}
              value={t.key}
              className="flex-1 flex items-center justify-center px-6 py-3 rounded-full font-semibold text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-200 data-[state=active]:to-pink-100 data-[state=active]:text-purple-900 data-[state=inactive]:text-muted-foreground hover:bg-purple-50"
            >
              {t.icon}
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="relative min-h-[320px]">
          <AnimatePresence mode="wait" initial={false}>
            {tabData.map((t) =>
              tab === t.key ? (
                <TabsContent key={t.key} value={t.key} forceMount>
                  <motion.div
                    key={t.key}
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -32 }}
                    transition={{ duration: 0.35, type: 'spring', bounce: 0.25 }}
                  >
                    {t.content}
                  </motion.div>
                </TabsContent>
              ) : null
            )}
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  );
}

export default FeatureTabs; 