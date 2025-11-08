import type { PostgrestError } from "@supabase/supabase-js";
import { supabaseClient } from "./supabaseClient";

type RpcSupportState = "unknown" | "supported" | "unsupported";

const adminCache = new Map<string, boolean>();
let rpcSupportState: RpcSupportState = "unknown";

const isPostgrestError = (error: unknown): error is PostgrestError =>
  Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      typeof (error as { code: unknown }).code === "string"
  );

const isMissingFunctionError = (error: unknown): boolean =>
  isPostgrestError(error) && error.code === "PGRST202";

const isNoRowError = (error: unknown): boolean =>
  isPostgrestError(error) && error.code === "PGRST116";

export const clearPlatformAdminCache = () => {
  adminCache.clear();
  rpcSupportState = "unknown";
};

export const fetchIsPlatformAdmin = async (
  userId?: string | null
): Promise<boolean> => {
  if (!userId) {
    return false;
  }

  const cached = adminCache.get(userId);
  if (typeof cached === "boolean") {
    return cached;
  }

  if (rpcSupportState !== "unsupported") {
    try {
      const { data } = await supabaseClient.rpc("is_platform_admin");

      if (typeof data === "boolean") {
        adminCache.set(userId, data);
        rpcSupportState = "supported";
        return data;
      }
    } catch (error) {
      if (isMissingFunctionError(error)) {
        rpcSupportState = "unsupported";
      } else if (isPostgrestError(error)) {
        console.warn("is_platform_admin RPC failed", error);
        rpcSupportState = "supported";
      } else {
        console.warn("Unexpected error from is_platform_admin RPC", error);
        rpcSupportState = "supported";
      }
    }
  }

  try {
    const { data, error } = await supabaseClient
      .from("platform_admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      if (isNoRowError(error)) {
        adminCache.set(userId, false);
        return false;
      }

      console.warn("Failed to resolve platform admin via table lookup", error);
      return false;
    }

    const result = Boolean(data);
    adminCache.set(userId, result);
    return result;
  } catch (error) {
    console.error("Unexpected error while resolving platform admin flag", error);
    return false;
  }
};


