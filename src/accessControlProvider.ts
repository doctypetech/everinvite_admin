import type { AccessControlProvider } from "@refinedev/core";
import { supabaseClient, fetchIsPlatformAdmin } from "./utility";

const PLATFORM_ADMIN_RESOURCES = new Set([
  "org_members",
  "platform_admins",
]);

const PLATFORM_ADMIN_WRITE_RESOURCES = new Set([
  "event_types",
  "templates",
  "themes",
]);

const WRITE_ACTIONS = new Set(["create", "edit", "delete"]);

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

    const isPlatformAdmin = await fetchIsPlatformAdmin(session.user.id);

    if (PLATFORM_ADMIN_RESOURCES.has(resourceName)) {
      return {
        can: isPlatformAdmin,
        reason: isPlatformAdmin ? undefined : "Requires platform admin access",
      };
    }

    if (
      PLATFORM_ADMIN_WRITE_RESOURCES.has(resourceName) &&
      WRITE_ACTIONS.has(actionName)
    ) {
      return {
        can: isPlatformAdmin,
        reason: isPlatformAdmin
          ? undefined
          : "Requires platform admin access to modify catalog resources",
      };
    }

    return {
      can: true,
    };
  },
};


