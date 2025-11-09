import type { AccessControlProvider } from "@refinedev/core";
import { supabaseClient, fetchIsSuperAdmin } from "./utility";

const PLATFORM_ADMIN_RESOURCES = new Set([
  "organization_members",
  "profiles",
]);

const PLATFORM_ADMIN_WRITE_RESOURCES = new Set([
  "events",
  "templates",
  "organizations",
  "org_aliases",
  "event_content",
  "event_translations",
  "template_translations",
  "event_content_translations",
  "invitees",
  "invitee_rsvps",
  "trivia_questions",
  "trivia_options",
  "trivia_answers",
  "trivia_question_translations",
  "trivia_option_translations",
  "faq",
  "faq_translations",
  "import_batches",
  "import_invitee_rows",
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

    const isSuperAdmin = await fetchIsSuperAdmin(session.user.id);

    if (PLATFORM_ADMIN_RESOURCES.has(resourceName)) {
      return {
        can: isSuperAdmin,
        reason: isSuperAdmin ? undefined : "Requires super admin access",
      };
    }

    if (
      PLATFORM_ADMIN_WRITE_RESOURCES.has(resourceName) &&
      WRITE_ACTIONS.has(actionName)
    ) {
      return {
        can: isSuperAdmin,
        reason: isSuperAdmin
          ? undefined
          : "Requires super admin access to modify this resource",
      };
    }

    return {
      can: true,
    };
  },
};


