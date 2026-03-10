import { format } from "date-fns";
import { useAllMemories } from "@/hooks/useMemories";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const TimelineView = () => {
  const { data: memories, isLoading } = useAllMemories();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!memories?.length) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-display">No memories yet</p>
        <p className="text-sm mt-1">Start by adding a memory to any date</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display mb-4">Your Timeline</h2>
      {memories.map((memory, i) => (
        <motion.div
          key={memory.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass rounded-xl p-4 space-y-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{memory.mood || "📝"}</span>
            <div>
              <p className="font-medium text-sm">{format(new Date(memory.date + "T00:00:00"), "EEEE, MMMM d, yyyy")}</p>
            </div>
          </div>
          {memory.text_entry && (
            <p className="text-sm text-muted-foreground line-clamp-3">{memory.text_entry}</p>
          )}
          {memory.media && memory.media.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {memory.media.slice(0, 4).map((m) => (
                <div key={m.id} className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                  {m.file_type === "photo" && (
                    <img src={m.file_url} alt="" className="w-full h-full object-cover" />
                  )}
                  {m.file_type === "video" && (
                    <video src={m.file_url} className="w-full h-full object-cover" />
                  )}
                  {m.file_type === "audio" && (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-xs">🎵</div>
                  )}
                </div>
              ))}
              {memory.media.length > 4 && (
                <div className="h-16 w-16 flex-shrink-0 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  +{memory.media.length - 4}
                </div>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default TimelineView;
