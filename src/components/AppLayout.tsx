import { useState } from "react";
import { Calendar, Clock, Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import CalendarView from "./CalendarView";
import DailyMemoryPage from "./DailyMemoryPage";
import TimelineView from "./TimelineView";
import OnThisDay from "./OnThisDay";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Tab = "calendar" | "timeline" | "onthisday";

const AppLayout = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("calendar");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "calendar", label: "Calendar", icon: <Calendar className="h-5 w-5" /> },
    { id: "timeline", label: "Timeline", icon: <Clock className="h-5 w-5" /> },
    { id: "onthisday", label: "On This Day", icon: <Sparkles className="h-5 w-5" /> },
  ];

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-display text-foreground">LifeCalendar</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:block">
            {user?.email}
          </span>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Desktop tab nav */}
      <div className="hidden md:flex border-b border-border/50 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedDate(null); }}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-4">
        <div className="max-w-2xl mx-auto p-4">
          <AnimatePresence mode="wait">
            {activeTab === "calendar" && !selectedDate && (
              <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CalendarView onSelectDate={handleSelectDate} selectedDate={selectedDate} />
              </motion.div>
            )}
            {activeTab === "calendar" && selectedDate && (
              <motion.div key="daily" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DailyMemoryPage date={selectedDate} onBack={() => setSelectedDate(null)} />
              </motion.div>
            )}
            {activeTab === "timeline" && (
              <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TimelineView />
              </motion.div>
            )}
            {activeTab === "onthisday" && (
              <motion.div key="onthisday" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <OnThisDay />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t border-border/50 flex justify-around py-2 px-4 z-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedDate(null); }}
            className={cn(
              "flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors",
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {tab.icon}
            <span className="text-[10px]">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AppLayout;
