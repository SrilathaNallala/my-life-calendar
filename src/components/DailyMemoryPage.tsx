import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { ArrowLeft, Image, Video, Mic, Save, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import MoodPicker from "./MoodPicker";
import { useMemoryForDate, useSaveMemory, useUploadMedia, useDeleteMedia } from "@/hooks/useMemories";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface DailyMemoryPageProps {
  date: Date;
  onBack: () => void;
}

const DailyMemoryPage = ({ date, onBack }: DailyMemoryPageProps) => {
  const dateStr = format(date, "yyyy-MM-dd");
  const { data: memory, isLoading } = useMemoryForDate(dateStr);
  const saveMemory = useSaveMemory();
  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();

  const [text, setText] = useState("");
  const [mood, setMood] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (memory) {
      setText(memory.text_entry || "");
      setMood(memory.mood || "");
    }
  }, [memory]);

  const handleSave = async () => {
    try {
      await saveMemory.mutateAsync({ date: dateStr, text_entry: text, mood });
      toast.success("Memory saved");
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    // Ensure memory exists first
    let memoryId = memory?.id;
    if (!memoryId) {
      const saved = await saveMemory.mutateAsync({ date: dateStr, text_entry: text, mood });
      memoryId = saved.id;
    }

    for (const file of Array.from(files)) {
      let fileType = "photo";
      if (file.type.startsWith("video/")) fileType = "video";
      else if (file.type.startsWith("audio/")) fileType = "audio";

      try {
        await uploadMedia.mutateAsync({ memoryId, file, fileType });
        toast.success(`${fileType} uploaded`);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteMedia = async (id: string, fileUrl: string) => {
    try {
      await deleteMedia.mutateAsync({ id, fileUrl });
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-display">{format(date, "EEEE")}</h2>
          <p className="text-sm text-muted-foreground">{format(date, "MMMM d, yyyy")}</p>
        </div>
      </div>

      <MoodPicker selected={mood} onSelect={setMood} />

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What happened today? How did you feel?"
        className="min-h-[150px] resize-none bg-secondary/50 border-border/50 focus:bg-card"
      />

      {/* Media display */}
      {memory?.media && memory.media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {memory.media.map((m) => (
            <div key={m.id} className="relative group rounded-lg overflow-hidden bg-muted aspect-square">
              {m.file_type === "photo" && (
                <img src={m.file_url} alt="" className="w-full h-full object-cover" />
              )}
              {m.file_type === "video" && (
                <video src={m.file_url} controls className="w-full h-full object-cover" />
              )}
              {m.file_type === "audio" && (
                <div className="flex items-center justify-center h-full p-3">
                  <audio src={m.file_url} controls className="w-full" />
                </div>
              )}
              <button
                onClick={() => handleDeleteMedia(m.id, m.file_url)}
                className="absolute top-1 right-1 p-1.5 rounded-full bg-destructive/80 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button variant="secondary" size="sm" onClick={() => {
          if (fileInputRef.current) {
            fileInputRef.current.accept = "image/*";
            fileInputRef.current.click();
          }
        }}>
          <Image className="h-4 w-4 mr-1" /> Photo
        </Button>
        <Button variant="secondary" size="sm" onClick={() => {
          if (fileInputRef.current) {
            fileInputRef.current.accept = "video/*";
            fileInputRef.current.click();
          }
        }}>
          <Video className="h-4 w-4 mr-1" /> Video
        </Button>
        <Button variant="secondary" size="sm" onClick={() => {
          if (fileInputRef.current) {
            fileInputRef.current.accept = "audio/*";
            fileInputRef.current.click();
          }
        }}>
          <Mic className="h-4 w-4 mr-1" /> Audio
        </Button>
        <div className="flex-1" />
        <Button onClick={handleSave} disabled={saveMemory.isPending} size="sm">
          {saveMemory.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          Save
        </Button>
      </div>
    </motion.div>
  );
};

export default DailyMemoryPage;
