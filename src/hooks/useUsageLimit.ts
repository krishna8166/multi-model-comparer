import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const MAX_FREE_COMPARISONS = 3;

export function useUsageLimit() {
  const { user } = useAuth();
  const [dailyUsage, setDailyUsage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.rpc("get_daily_usage", { p_user_id: user.id });
    if (!error) setDailyUsage(data ?? 0);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const canCompare = dailyUsage < MAX_FREE_COMPARISONS;

  const logUsage = async (topic: string) => {
    if (!user) return false;
    const { error } = await supabase.from("comparison_logs").insert({ user_id: user.id, topic });
    if (error) return false;
    setDailyUsage((prev) => prev + 1);
    return true;
  };

  return { dailyUsage, maxUsage: MAX_FREE_COMPARISONS, canCompare, logUsage, loading };
}
