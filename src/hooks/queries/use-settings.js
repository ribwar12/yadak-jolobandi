"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { settingsService } from "@/services/settings.service";

export function useSiteSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => settingsService.getSettings(),
  });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => settingsService.updateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      toast.success("تنظیمات فروشگاه بروزرسانی شد");
    },
    onError: (err) => {
      toast.error(err?.message || "خطا در ذخیره تنظیمات");
    },
  });
}
