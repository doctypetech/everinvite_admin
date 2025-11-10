import type { AccessControlProvider } from "@refinedev/core";
import { supabaseClient, fetchIsSuperAdmin } from "./utility";

const PLATFORM_ADMIN_RESOURCES = new Set([
  "organization_members",
  "profiles",
]);

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action }) => {
    const resourceName = resource ?? "";
    const actionName = action ?? "read";

    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session?.user) {
      return {
        can: false,
        reason: "Unauthenticated",
      };
    }

    const isSuperAdmin = await fetchIsSuperAdmin(session.user.id);

    if (PLATFORM_ADMIN_RESOURCES.has(resourceName)) {
      return {
        can: isSuperAdmin,
        reason: isSuperAdmin ? undefined : "Requires super admin access",
      };
    }

    return {
      can: true,
    };
  },
};


