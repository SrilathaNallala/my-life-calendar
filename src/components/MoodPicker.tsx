import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const MOODS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😢", label: "Sad" },
  { emoji: "🤩", label: "Excited" },
  { emoji: "😌", label: "Peaceful" },
  { emoji: "😴", label: "Tired" },
];

interface MoodPickerProps {
  selected: string;
  onSelect: (mood: string) => void;
}

const MoodPicker = ({ selected, onSelect }: MoodPickerProps) => {
  return (
    <div className="flex gap-2 justify-center">
      {MOODS.map(({ emoji, label }) => (
        <motion.button
          key={emoji}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => onSelect(emoji)}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
            selected === emoji
              ? "bg-primary/15 ring-2 ring-primary/30"
              : "hover:bg-secondary"
          )}
        >
          <span className="text-2xl">{emoji}</span>
          <span className="text-[10px] text-muted-foreground">{label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default MoodPicker;
