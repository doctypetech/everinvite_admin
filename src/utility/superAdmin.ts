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

export const clearSuperAdminCache = () => {
  adminCache.clear();
  rpcSupportState = "unknown";
};

export const fetchIsSuperAdmin = async (
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
      const { data } = await supabaseClient.rpc("is_super_admin");

      if (typeof data === "boolean") {
        adminCache.set(userId, data);
        rpcSupportState = "supported";
        return data;
      }
    } catch (error) {
      if (isMissingFunctionError(error)) {
        rpcSupportState = "unsupported";
      } else if (isPostgrestError(error)) {
        console.warn("is_super_admin RPC failed", error);
        rpcSupportState = "supported";
      } else {
        console.warn("Unexpected error from is_super_admin RPC", error);
        rpcSupportState = "supported";
      }
    }
  }

  try {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .eq("role", "super_admin")
      .maybeSingle();

    if (error) {
      if (isNoRowError(error)) {
        adminCache.set(userId, false);
        return false;
      }

      console.warn("Failed to resolve super admin via table lookup", error);
      return false;
    }

    const result = Boolean(data);
    adminCache.set(userId, result);
    return result;
  } catch (error) {
    console.error(
      "Unexpected error while resolving super admin flag from profiles",
      error
    );
    return false;
  }
};


