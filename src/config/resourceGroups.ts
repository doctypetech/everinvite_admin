export type ResourceGroupSection = {
  resource: string;
  title?: string;
  description?: string;
};

export type ResourceGroupDefinition = {
  /**
   * Unique identifier used for Refine resource name and routing.
   */
  name: string;
  /**
   * Human readable label shown in the sidebar.
   */
  label: string;
  /**
   * Route path registered under `/admin`.
   */
  route: string;
  /**
   * Related resources rendered together inside the group page.
   */
  sections: ResourceGroupSection[];
};

export const RESOURCE_GROUP_DEFINITIONS: ResourceGroupDefinition[] = [
  {
    name: "event",
    label: "Event",
    route: "/admin/event",
    sections: [
      { resource: "events", title: "Events" },
      { resource: "event_translations", title: "Event Translations" },
    ],
  },
  {
    name: "template",
    label: "Template",
    route: "/admin/template",
    sections: [
      { resource: "templates", title: "Templates" },
      { resource: "template_translations", title: "Template Translations" },
    ],
  },
  {
    name: "organization",
    label: "Organization",
    route: "/admin/organization",
    sections: [
      { resource: "organizations", title: "Organizations" },
      { resource: "organization_members", title: "Organization Members" },
      { resource: "org_aliases", title: "Organization Aliases" },
    ],
  },
  {
    name: "profile",
    label: "Profile",
    route: "/admin/profile",
    sections: [{ resource: "profiles", title: "Profiles" }],
  },
  {
    name: "event-content",
    label: "Event Content",
    route: "/admin/event-content",
    sections: [
      { resource: "event_content", title: "Event Content" },
      {
        resource: "event_content_translations",
        title: "Event Content Translations",
      },
    ],
  },
  {
    name: "invitees",
    label: "Invitees",
    route: "/admin/invitees",
    sections: [
      { resource: "invitees", title: "Invitees" },
      { resource: "invitee_rsvps", title: "Invitee RSVPs" },
    ],
  },
  {
    name: "imports",
    label: "Imports",
    route: "/admin/imports",
    sections: [
      { resource: "import_batches", title: "Import Batches" },
      { resource: "import_invitee_rows", title: "Import Rows" },
    ],
  },
  {
    name: "trivia",
    label: "Trivia",
    route: "/admin/trivia",
    sections: [
      { resource: "trivia_questions", title: "Trivia Questions" },
      { resource: "trivia_options", title: "Trivia Options" },
      { resource: "trivia_answers", title: "Trivia Answers" },
      {
        resource: "trivia_question_translations",
        title: "Question Translations",
      },
      {
        resource: "trivia_option_translations",
        title: "Option Translations",
      },
    ],
  },
  {
    name: "faq",
    label: "FAQ",
    route: "/admin/faq",
    sections: [
      { resource: "faq", title: "FAQ" },
      { resource: "faq_translations", title: "FAQ Translations" },
    ],
  },
];

export const RESOURCE_GROUP_DEFINITION_MAP: Record<
  string,
  ResourceGroupDefinition
> = RESOURCE_GROUP_DEFINITIONS.reduce((acc, definition) => {
  acc[definition.name] = definition;
  return acc;
}, {} as Record<string, ResourceGroupDefinition>);

export const RESOURCE_GROUP_ROUTE_BY_RESOURCE: Record<string, string> =
  RESOURCE_GROUP_DEFINITIONS.reduce(
    (acc, definition) => {
      definition.sections.forEach((section) => {
        acc[section.resource] = definition.route;
      });
      return acc;
    },
    {} as Record<string, string>
  );

