import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemoriesForMonth } from "@/hooks/useMemories";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const MOOD_COLORS: Record<string, string> = {
  "😊": "bg-warm-glow/30",
  "😢": "bg-sky/30",
  "🤩": "bg-accent/30",
  "😌": "bg-sage/30",
  "😴": "bg-lavender/30",
};

interface CalendarViewProps {
  onSelectDate: (date: Date) => void;
  selectedDate: Date | null;
}

const CalendarView = ({ onSelectDate, selectedDate }: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: memories } = useMemoriesForMonth(currentMonth.getFullYear(), currentMonth.getMonth());

  const memoryMap = useMemo(() => {
    const map = new Map<string, string>();
    memories?.forEach((m) => map.set(m.date, m.mood || ""));
    return map;
  }, [memories]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-display text-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const dateStr = format(d, "yyyy-MM-dd");
          const mood = memoryMap.get(dateStr);
          const hasMemory = memoryMap.has(dateStr);
          const isCurrentMonth = isSameMonth(d, currentMonth);
          const isSelected = selectedDate && isSameDay(d, selectedDate);
          const isToday = isSameDay(d, new Date());

          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectDate(d)}
              className={cn(
                "relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all",
                !isCurrentMonth && "opacity-30",
                isCurrentMonth && "hover:bg-secondary",
                isSelected && "ring-2 ring-primary bg-primary/10",
                isToday && !isSelected && "font-bold text-primary",
                hasMemory && mood && MOOD_COLORS[mood],
                hasMemory && !mood && "bg-primary/10"
              )}
            >
              <span>{format(d, "d")}</span>
              {hasMemory && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
