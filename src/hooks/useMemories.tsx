import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { format } from "date-fns";

export interface Memory {
  id: string;
  user_id: string;
  date: string;
  text_entry: string | null;
  mood: string | null;
  created_at: string;
  updated_at: string;
  media?: MediaItem[];
}

export interface MediaItem {
  id: string;
  memory_id: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

export const useMemoriesForMonth = (year: number, month: number) => {
  const { user } = useAuth();
  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endMonth = month === 11 ? 0 : month + 1;
  const endYear = month === 11 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth + 1).padStart(2, "0")}-01`;

  return useQuery({
    queryKey: ["memories", "month", year, month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memories")
        .select("id, date, mood")
        .gte("date", startDate)
        .lt("date", endDate);
      if (error) throw error;
      return data as Pick<Memory, "id" | "date" | "mood">[];
    },
    enabled: !!user,
  });
};

export const useMemoryForDate = (date: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["memory", date],
    queryFn: async () => {
      const { data: memory, error } = await supabase
        .from("memories")
        .select("*")
        .eq("date", date)
        .maybeSingle();
      if (error) throw error;
      if (!memory) return null;

      const { data: media } = await supabase
        .from("media")
        .select("*")
        .eq("memory_id", memory.id);

      return { ...memory, media: media || [] } as Memory;
    },
    enabled: !!user && !!date,
  });
};

export const useSaveMemory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ date, text_entry, mood }: { date: string; text_entry?: string; mood?: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("memories")
        .select("id")
        .eq("date", date)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const updateData: Record<string, string> = {};
        if (text_entry !== undefined) updateData.text_entry = text_entry;
        if (mood !== undefined) updateData.mood = mood;

        const { data, error } = await supabase
          .from("memories")
          .update(updateData)
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("memories")
          .insert({ user_id: user.id, date, text_entry: text_entry || "", mood: mood || "" })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["memory", data.date] });
      queryClient.invalidateQueries({ queryKey: ["memories"] });
    },
  });
};

export const useUploadMedia = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memoryId, file, fileType }: { memoryId: string; file: File; fileType: string }) => {
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop();
      const path = `${user.id}/${memoryId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("memories-media")
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("memories-media")
        .getPublicUrl(path);

      const { error } = await supabase
        .from("media")
        .insert({ memory_id: memoryId, file_url: publicUrl, file_type: fileType });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memory"] });
    },
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, fileUrl }: { id: string; fileUrl: string }) => {
      // Extract path from URL
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split("/memories-media/");
      if (pathParts[1]) {
        await supabase.storage.from("memories-media").remove([pathParts[1]]);
      }

      const { error } = await supabase.from("media").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memory"] });
    },
  });
};

export const useAllMemories = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["memories", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;

      // Fetch media for each memory
      const memoriesWithMedia = await Promise.all(
        (data || []).map(async (memory) => {
          const { data: media } = await supabase
            .from("media")
            .select("*")
            .eq("memory_id", memory.id);
          return { ...memory, media: media || [] } as Memory;
        })
      );

      return memoriesWithMedia;
    },
    enabled: !!user,
  });
};

export const useOnThisDay = () => {
  const { user } = useAuth();
  const today = format(new Date(), "MM-dd");

  return useQuery({
    queryKey: ["memories", "onThisDay", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .like("date", `%-${today}`);
      if (error) throw error;

      const todayDate = format(new Date(), "yyyy-MM-dd");
      const filtered = (data || []).filter((m) => m.date !== todayDate);

      const memoriesWithMedia = await Promise.all(
        filtered.map(async (memory) => {
          const { data: media } = await supabase
            .from("media")
            .select("*")
            .eq("memory_id", memory.id);
          return { ...memory, media: media || [] } as Memory;
        })
      );

      return memoriesWithMedia;
    },
    enabled: !!user,
  });
};
