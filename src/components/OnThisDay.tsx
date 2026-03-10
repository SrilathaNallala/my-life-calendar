import { format } from "date-fns";
import { useOnThisDay } from "@/hooks/useMemories";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const OnThisDay = () => {
  const { data: memories, isLoading } = useOnThisDay();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-display">On This Day</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Memories from {format(new Date(), "MMMM d")} in previous years
      </p>

      {!memories?.length ? (
        <div className="text-center py-12 text-muted-foreground glass rounded-xl">
          <p className="text-sm">No memories from this date in previous years</p>
        </div>
      ) : (
        memories.map((memory, i) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-4 space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{memory.mood || "📝"}</span>
              <p className="font-medium text-sm">
                {format(new Date(memory.date + "T00:00:00"), "yyyy")}
              </p>
            </div>
            {memory.text_entry && (
              <p className="text-sm text-muted-foreground">{memory.text_entry}</p>
            )}
            {memory.media && memory.media.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {memory.media.map((m) => (
                  <div key={m.id} className="h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                    {m.file_type === "photo" && (
                      <img src={m.file_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))
      )}
    </div>
  );
};

export default OnThisDay;
