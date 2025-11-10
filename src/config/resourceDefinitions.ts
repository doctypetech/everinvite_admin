import type { CrudFilters, CrudSort } from "@refinedev/core";
import type { ReactNode } from "react";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "json"
  | "datetime";

export type FieldRelation = {
  resource: string;
  optionLabel: string | ((item: Record<string, any>) => string);
  optionValue?:
    | string
    | ((item: Record<string, any>) => string | number | boolean | undefined);
  meta?: Record<string, unknown>;
};

export type FieldOption = {
  label: string;
  value: string | number | boolean;
};

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  enumValues?: FieldOption[];
  relation?: FieldRelation;
  helperText?: ReactNode;
  disabledOnCreate?: boolean;
  disabledOnEdit?: boolean;
  defaultValue?: unknown;
  min?: number;
  max?: number;
  step?: number;
}

export interface ColumnDefinition {
  key: string;
  title: string;
  type?: FieldType;
  render?: (value: unknown, record: Record<string, unknown>) => ReactNode;
  width?: number;
}

export interface ResourceDefinition {
  name: string;
  label: string;
  routes: {
    list: string;
    create?: string;
    edit?: string;
  };
  canDelete?: boolean;
  orgFilterField?: string;
  list?: {
    columns: ColumnDefinition[];
    meta?: Record<string, unknown>;
    initialSorters?: CrudSort[];
    initialFilters?: CrudFilters;
  };
  form: {
    fields: FieldDefinition[];
    meta?: Record<string, unknown>;
  };
  getRecordId?: (record: Record<string, any>) => string;
}

const orgRoleOptions: FieldOption[] = [
  { label: "Viewer", value: "viewer" },
  { label: "Editor", value: "editor" },
  { label: "Admin", value: "admin" },
  { label: "Owner", value: "owner" },
];

const userRoleOptions: FieldOption[] = [
  { label: "Super Admin", value: "super_admin" },
  { label: "Member", value: "member" },
];

const inviteeStatusOptions: FieldOption[] = [
  { label: "Pending", value: "pending" },
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
  { label: "Maybe", value: "maybe" },
];

const rsvpResponseOptions: FieldOption[] = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
  { label: "Maybe", value: "maybe" },
];

const rsvpSourceOptions: FieldOption[] = [
  { label: "Web", value: "web" },
  { label: "Excel", value: "excel" },
  { label: "Admin", value: "admin" },
];

const importSourceOptions: FieldOption[] = [
  { label: "Excel", value: "excel" },
  { label: "CSV", value: "csv" },
  { label: "Manual", value: "manual" },
];

const importRowStatusOptions: FieldOption[] = [
  { label: "Pending", value: "pending" },
  { label: "OK", value: "ok" },
  { label: "Error", value: "error" },
  { label: "Skipped", value: "skipped" },
];

const aliasKindOptions: FieldOption[] = [
  { label: "Slug", value: "slug" },
  { label: "Domain", value: "domain" },
];

export const RESOURCE_DEFINITIONS: ResourceDefinition[] = [
  {
    name: "events",
    label: "Events",
    routes: {
      list: "/admin/events",
      create: "/admin/events/create",
      edit: "/admin/events/edit/:id",
    },
    form: {
      fields: [
        {
          key: "name",
          label: "Name",
          type: "text",
          required: true,
        },
      ],
    },
    list: {
      columns: [
        { key: "name", title: "Name", type: "text" },
        { key: "created_at", title: "Created", type: "datetime" },
        { key: "updated_at", title: "Updated", type: "datetime" },
      ],
      initialSorters: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
  },
  {
    name: "templates",
    label: "Templates",
    routes: {
      list: "/admin/templates",
      create: "/admin/templates/create",
      edit: "/admin/templates/edit/:id",
    },
    form: {
      fields: [
        {
          key: "event_id",
          label: "Event",
          type: "select",
          relation: {
            resource: "events",
            optionLabel: "name",
          },
          required: true,
        },
        {
          key: "name",
          label: "Name",
          type: "text",
          required: true,
        },
        {
          key: "metadata",
          label: "Metadata",
          type: "json",
          defaultValue: "{}",
        },
      ],
    },
    list: {
      columns: [
        { key: "name", title: "Name", type: "text" },
        { key: "event_id", title: "Event ID", type: "text" },
        { key: "created_at", title: "Created", type: "datetime" },
      ],
      initialSorters: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
  },
  {
    name: "organizations",
    label: "Organizations",
    orgFilterField: "id",
    routes: {
      list: "/admin/organizations",
      create: "/admin/organizations/create",
      edit: "/admin/organizations/edit/:id",
    },
    form: {
      fields: [
        {
          key: "name",
          label: "Name",
          type: "text",
          required: true,
        },
        {
          key: "slug",
          label: "Slug",
          type: "text",
          required: true,
        },
        {
          key: "template_id",
          label: "Template",
          type: "select",
          relation: {
            resource: "templates",
            optionLabel: "name",
          },
        },
        {
          key: "config",
          label: "Config",
          type: "json",
          defaultValue: "{}",
        },
      ],
    },
    list: {
      columns: [
        { key: "name", title: "Name", type: "text" },
        { key: "slug", title: "Slug", type: "text" },
        { key: "created_at", title: "Created", type: "datetime" },
      ],
      initialSorters: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
  },
  {
    name: "profiles",
    label: "Profiles",
    routes: {
      list: "/admin/profiles",
      create: "/admin/profiles/create",
      edit: "/admin/profiles/edit/:id",
    },
    form: {
      fields: [
        {
          key: "id",
          label: "User ID",
          type: "text",
          required: true,
          helperText: "Must match an existing auth user ID.",
          disabledOnEdit: true,
        },
        {
          key: "full_name",
          label: "Full Name",
          type: "text",
        },
        {
          key: "phone",
          label: "Phone",
          type: "text",
        },
        {
          key: "role",
          label: "Role",
          type: "select",
          enumValues: userRoleOptions,
          required: true,
          defaultValue: "member",
        },
      ],
    },
    list: {
      columns: [
        { key: "id", title: "User ID", type: "text" },
        { key: "full_name", title: "Full Name", type: "text" },
        { key: "role", title: "Role", type: "text" },
        { key: "created_at", title: "Created", type: "datetime" },
      ],
    },
  },
  {
    name: "organization_members",
    label: "Organization Members",
    routes: {
      list: "/admin/organization-members",
      create: "/admin/organization-members/create",
      edit: "/admin/organization-members/edit/:id",
    },
    canDelete: true,
    getRecordId: (record) =>
      `${record.organization_id ?? ""}:${record.user_id ?? ""}`,
    form: {
      fields: [
        {
          key: "organization_id",
          label: "Organization",
          type: "select",
          relation: {
            resource: "organizations",
            optionLabel: "name",
          },
          required: true,
          disabledOnEdit: true,
        },
        {
          key: "user_id",
          label: "Profile",
          type: "select",
          relation: {
            resource: "profiles",
            optionLabel: "full_name",
            optionValue: "id",
          },
          required: true,
          disabledOnEdit: true,
        },
        {
          key: "role",
          label: "Role",
          type: "select",
          enumValues: orgRoleOptions,
          required: true,
          defaultValue: "viewer",
        },
      ],
    },
    list: {
      columns: [
        { key: "organization_id", title: "Organization ID", type: "text" },
        { key: "user_id", title: "User ID", type: "text" },
        { key: "role", title: "Role", type: "text" },
        { key: "created_at", title: "Created", type: "datetime" },
      ],
    },
  },
  {
    name: "org_aliases",
    label: "Organization Aliases",
    routes: {
      list: "/admin/org-aliases",
      create: "/admin/org-aliases/create",
      edit: "/admin/org-aliases/edit/:id",
    },
    form: {
      fields: [
        {
          key: "organization_id",
          label: "Organization",
          type: "select",
          relation: {
            resource: "organizations",
            optionLabel: "name",
          },
          required: true,
        },
        {
          key: "kind",
          label: "Kind",
          type: "select",
          enumValues: aliasKindOptions,
          required: true,
        },
        {
          key: "value",
          label: "Value",
          type: "text",
          required: true,
        },
        {
          key: "is_primary",
          label: "Primary",
          type: "boolean",
          defaultValue: false,
        },
        {
          key: "verified_at",
          label: "Verified At",
          type: "datetime",
        },
      ],
    },
    list: {
      columns: [
        { key: "organization_id", title: "Organization ID", type: "text" },
        { key: "kind", title: "Kind", type: "text" },
        { key: "value", title: "Value", type: "text" },
        { key: "is_primary", title: "Primary", type: "boolean" },
        { key: "verified_at", title: "Verified At", type: "datetime" },
      ],
    },
  },
  {
    name: "event_content",
    label: "Event Content",
    routes: {
      list: "/admin/event-content",
      create: "/admin/event-content/create",
      edit: "/admin/event-content/edit/:id",
    },
    form: {
      fields: [
        {
          key: "organization_id",
          label: "Organization",
          type: "select",
          relation: {
            resource: "organizations",
            optionLabel: "name",
          },
          required: true,
        },
        {
          key: "title",
          label: "Title",
          type: "text",
        },
        {
          key: "body_html",
          label: "Body HTML",
          type: "textarea",
        },
        {
          key: "cta",
          label: "CTA (JSON)",
          type: "json",
        },
      ],
    },
    list: {
      columns: [
        { key: "organization_id", title: "Organization ID", type: "text" },
        { key: "title", title: "Title", type: "text" },
        { key: "created_at", title: "Created", type: "datetime" },
      ],
    },
  },
  {
    name: "event_translations",
    label: "Event Translations",
    routes: {
      list: "/admin/event-translations",
      create: "/admin/event-translations/create",
      edit: "/admin/event-translations/edit/:id",
    },
    form: {
      fields: [
        {
          key: "event_id",
          label: "Event",
          type: "select",
          relation: {
            resource: "events",
            optionLabel: "name",
          },
          required: true,
        },
        {
          key: "locale",
          label: "Locale",
          type: "text",
          required: true,
        },
        {
          key: "name",
          label: "Name",
          type: "text",
          required: true,
        },
      ],
    },
    list: {
      columns: [
        { key: "event_id", title: "Event ID", type: "text" },
        { key: "locale", title: "Locale", type: "text" },
        { key: "name", title: "Name", type: "text" },
      ],
    },
  },
  {
    name: "template_translations",
    label: "Template Translations",
    routes: {
      list: "/admin/template-translations",
      create: "/admin/template-translations/create",
      edit: "/admin/template-translations/edit/:id",
    },
    form: {
      fields: [
        {
          key: "template_id",
          label: "Template",
          type: "select",
          relation: {
            resource: "templates",
            optionLabel: "name",
          },
          required: true,
        },
        {
          key: "locale",
          label: "Locale",
          type: "text",
          required: true,
        },
        {
          key: "name",
          label: "Name",
          type: "text",
          required: true,
        },
        {
          key: "metadata",
          label: "Metadata",
          type: "json",
          defaultValue: "{}",
        },
      ],
    },
    list: {
      columns: [
        { key: "template_id", title: "Template ID", type: "text" },
        { key: "locale", title: "Locale", type: "text" },
        { key: "name", title: "Name", type: "text" },
      ],
    },
  },
  {
    name: "event_content_translations",
    label: "Event Content Translations",
    routes: {
      list: "/admin/event-content-translations",
      create: "/admin/event-content-translations/create",
      edit: "/admin/event-content-translations/edit/:id",
    },
    form: {
      fields: [
        {
          key: "event_content_id",
          label: "Event Content",
          type: "select",
          relation: {
            resource: "event_content",
            optionLabel: "title",
          },
          required: true,
        },
        {
          key: "locale",
          label: "Locale",
          type: "text",
          required: true,
        },
        {
          key: "title",
          label: "Title",
          type: "text",
        },
        {
          key: "body_html",
          label: "Body HTML",
          type: "textarea",
        },
        {
          key: "cta",
          label: "CTA (JSON)",
          type: "json",
        },
      ],
    },
    list: {
      columns: [
        {
          key: "event_content_id",
          title: "Content ID",
          type: "text",
        },
        { key: "locale", title: "Locale", type: "text" },
        { key: "title", title: "Title", type: "text" },
      ],
    },
  },
  {
    name: "invitees",
    label: "Invitees",
    routes: {
      list: "/admin/invitees",
      create: "/admin/invitees/create",
      edit: "/admin/invitees/edit/:id",
    },
    form: {
      fields: [
        {
          key: "organization_id",
          label: "Organization",
          type: "select",
          relation: {
            resource: "organizations",
            optionLabel: "name",
          },
          required: true,
        },
        {
          key: "full_name",
          label: "Full Name",
          type: "text",
          required: true,
        },
        {
          key: "phone_number",
          label: "Phone Number",
          type: "text",
        },
        {
          key: "company",
          label: "Company",
          type: "text",
        },
        {
          key: "max_guests_allowed",
          label: "Max Guests Allowed",
          type: "number",
          min: 0,
          max: 10,
          defaultValue: 2,
        },
        {
          key: "attending_guests",
          label: "Attending Guests",
          type: "number",
          min: 0,
          max: 10,
          defaultValue: 0,
        },
        {
          key: "status",
          label: "Status",
          type: "select",
          enumValues: inviteeStatusOptions,
          defaultValue: "pending",
          required: true,
        },
        {
          key: "access_code",
          label: "Access Code",
          type: "text",
          required: true,
        },
      ],
    },
    list: {
      columns: [
        { key: "organization_id", title: "Organization ID", type: "text" },
        { key: "full_name", title: "Full Name", type: "text" },
        { key: "status", title: "Status", type: "text" },
        { key: "attending_guests", title: "Guests", type: "number" },
      ],
    },
  },
  {
    name: "invitee_rsvps",
    label: "Invitee RSVPs",
    routes: {
      list: "/admin/invitee-rsvps",
      create: "/admin/invitee-rsvps/create",
      edit: "/admin/invitee-rsvps/edit/:id",
    },
    form: {
      fields: [
        {
          key: "invitee_id",
          label: "Invitee",
          type: "select",
          relation: {
            resource: "invitees",
            optionLabel: "full_name",
          },
          required: true,
        },
        {
          key: "guests_count",
          label: "Guests Count",
          type: "number",
          min: 0,
          max: 10,
          required: true,
        },
        {
          key: "response",
          label: "Response",
          type: "select",
          enumValues: rsvpResponseOptions,
          required: true,
        },
        {
          key: "source",
          label: "Source",
          type: "select",
          enumValues: rsvpSourceOptions,
          defaultValue: "web",
        },
        {
          key: "submitted_at",
          label: "Submitted At",
          type: "datetime",
        },
      ],
    },
    list: {
      columns: [
        { key: "invitee_id", title: "Invitee ID", type: "text" },
        { key: "response", title: "Response", type: "text" },
        { key: "guests_count", title: "Guests", type: "number" },
        { key: "submitted_at", title: "Submitted", type: "datetime" },
      ],
    },
  },
  {
    name: "import_batches",
    label: "Import Batches",
    routes: {
      list: "/admin/import-batches",
      create: "/admin/import-batches/create",
      edit: "/admin/import-batches/edit/:id",
    },
    form: {
      fields: [
        {
          key: "organization_id",
          label: "Organization",
          type: "select",
          relation: {
            resource: "organizations",
            optionLabel: "name",
          },
          required: true,
        },
        {
          key: "source",
          label: "Source",
          type: "select",
          enumValues: importSourceOptions,
          defaultValue: "excel",
          required: true,
        },
        {
          key: "file_name",
          label: "File Name",
          type: "text",
        },
        {
          key: "imported_by",
          label: "Imported By (Profile)",
          type: "select",
          relation: {
            resource: "profiles",
            optionLabel: "full_name",
            optionValue: "id",
          },
        },
        {
          key: "total_rows",
          label: "Total Rows",
          type: "number",
          min: 0,
          defaultValue: 0,
        },
        {
          key: "processed_rows",
          label: "Processed Rows",
          type: "number",
          min: 0,
          defaultValue: 0,
        },
        {
          key: "success_rows",
          label: "Success Rows",
          type: "number",
          min: 0,
          defaultValue: 0,
        },
        {
          key: "error_rows",
          label: "Error Rows",
          type: "number",
          min: 0,
          defaultValue: 0,
        },
        {
          key: "finished_at",
          label: "Finished At",
          type: "datetime",
        },
      ],
    },
    list: {
      columns: [
        { key: "organization_id", title: "Organization ID", type: "text" },
        { key: "source", title: "Source", type: "text" },
        { key: "total_rows", title: "Total Rows", type: "number" },
        { key: "processed_rows", title: "Processed Rows", type: "number" },
        { key: "created_at", title: "Created", type: "datetime" },
      ],
    },
  },
  {
    name: "import_invitee_rows",
    label: "Import Rows",
    routes: {
      list: "/admin/import-rows",
      create: "/admin/import-rows/create",
      edit: "/admin/import-rows/edit/:id",
    },
    form: {
      fields: [
        {
          key: "batch_id",
          label: "Batch",
          type: "select",
          relation: {
            resource: "import_batches",
            optionLabel: "id",
          },
          required: true,
        },
        {
          key: "row_number",
          label: "Row Number",
          type: "number",
          min: 0,
          required: true,
        },
        {
          key: "raw_data",
          label: "Raw Data",
          type: "json",
          required: true,
        },
        {
          key: "normalized",
          label: "Normalized",
          type: "json",
        },
        {
          key: "status",
          label: "Status",
          type: "select",
          enumValues: importRowStatusOptions,
          defaultValue: "pending",
        },
        {
          key: "error_message",
          label: "Error Message",
          type: "textarea",
        },
        {
          key: "processed_at",
          label: "Processed At",
          type: "datetime",
        },
      ],
    },
    list: {
      columns: [
        { key: "batch_id", title: "Batch ID", type: "text" },
        { key: "row_number", title: "Row Number", type: "number" },
        { key: "status", title: "Status", type: "text" },
        { key: "processed_at", title: "Processed", type: "datetime" },
      ],
    },
  },
  {
    name: "trivia_questions",
    label: "Trivia Questions",
    routes: {
      list: "/admin/trivia/questions",
      create: "/admin/trivia/questions/create",
      edit: "/admin/trivia/questions/edit/:id",
    },
    form: {
      fields: [
        {
          key: "organization_id",
          label: "Organization",
          type: "select",
          relation: {
            resource: "organizations",
            optionLabel: "name",
          },
          required: true,
        },
        {
          key: "question",
          label: "Question",
          type: "textarea",
          required: true,
        },
      ],
    },
    list: {
      columns: [
        { key: "organization_id", title: "Organization ID", type: "text" },
        { key: "question", title: "Question", type: "text" },
        { key: "created_at", title: "Created", type: "datetime" },
      ],
    },
  },
  {
    name: "trivia_options",
    label: "Trivia Options",
    routes: {
      list: "/admin/trivia/options",
      create: "/admin/trivia/options/create",
      edit: "/admin/trivia/options/edit/:id",
    },
    form: {
      fields: [
        {
          key: "question_id",
          label: "Question",
          type: "select",
          relation: {
            resource: "trivia_questions",
            optionLabel: "question",
          },
          required: true,
        },
        {
          key: "option_text",
          label: "Option Text",
          type: "textarea",
          required: true,
        },
        {
          key: "is_correct",
          label: "Is Correct",
          type: "boolean",
          defaultValue: false,
        },
      ],
    },
    list: {
      columns: [
        { key: "question_id", title: "Question ID", type: "text" },
        { key: "option_text", title: "Option Text", type: "text" },
        { key: "is_correct", title: "Correct", type: "boolean" },
      ],
    },
  },
  {
    name: "trivia_answers",
    label: "Trivia Answers",
    routes: {
      list: "/admin/trivia/answers",
      create: "/admin/trivia/answers/create",
      edit: "/admin/trivia/answers/edit/:id",
    },
    form: {
      fields: [
        {
          key: "organization_id",
          label: "Organization",
          type: "select",
          relation: {
            resource: "organizations",
            optionLabel: "name",
          },
          required: true,
        },
        {
          key: "respondent_name",
          label: "Respondent Name",
          type: "text",
          required: true,
        },
        {
          key: "question_id",
          label: "Question",
          type: "select",
          relation: {
            resource: "trivia_questions",
            optionLabel: "question",
          },
          required: true,
        },
        {
          key: "option_id",
          label: "Option",
          type: "select",
          relation: {
            resource: "trivia_options",
            optionLabel: "option_text",
          },
          required: true,
        },
        {
          key: "invitee_id",
          label: "Invitee",
          type: "select",
          relation: {
            resource: "invitees",
            optionLabel: "full_name",
          },
        },
      ],
    },
    list: {
      columns: [
        { key: "organization_id", title: "Organization ID", type: "text" },
        { key: "respondent_name", title: "Respondent", type: "text" },
        { key: "question_id", title: "Question ID", type: "text" },
        { key: "option_id", title: "Option ID", type: "text" },
        { key: "created_at", title: "Created", type: "datetime" },
      ],
    },
  },
  {
    name: "trivia_question_translations",
    label: "Trivia Question Translations",
    routes: {
      list: "/admin/trivia/question-translations",
      create: "/admin/trivia/question-translations/create",
      edit: "/admin/trivia/question-translations/edit/:id",
    },
    form: {
      fields: [
        {
          key: "question_id",
          label: "Question",
          type: "select",
          relation: {
            resource: "trivia_questions",
            optionLabel: "question",
          },
          required: true,
        },
        {
          key: "locale",
          label: "Locale",
          type: "text",
          required: true,
        },
        {
          key: "question",
          label: "Question (Translated)",
          type: "textarea",
          required: true,
        },
      ],
    },
    list: {
      columns: [
        { key: "question_id", title: "Question ID", type: "text" },
        { key: "locale", title: "Locale", type: "text" },
        { key: "question", title: "Question", type: "text" },
      ],
    },
  },
  {
    name: "trivia_option_translations",
    label: "Trivia Option Translations",
    routes: {
      list: "/admin/trivia/option-translations",
      create: "/admin/trivia/option-translations/create",
      edit: "/admin/trivia/option-translations/edit/:id",
    },
    form: {
      fields: [
        {
          key: "option_id",
          label: "Option",
          type: "select",
          relation: {
            resource: "trivia_options",
            optionLabel: "option_text",
          },
          required: true,
        },
        {
          key: "locale",
          label: "Locale",
          type: "text",
          required: true,
        },
        {
          key: "option_text",
          label: "Option Text",
          type: "textarea",
          required: true,
        },
      ],
    },
    list: {
      columns: [
        { key: "option_id", title: "Option ID", type: "text" },
        { key: "locale", title: "Locale", type: "text" },
        { key: "option_text", title: "Option Text", type: "text" },
      ],
    },
  },
  {
    name: "faq",
    label: "FAQ",
    routes: {
      list: "/admin/faq",
      create: "/admin/faq/create",
      edit: "/admin/faq/edit/:id",
    },
    form: {
      fields: [
        {
          key: "question",
          label: "Question",
          type: "text",
          required: true,
        },
        {
          key: "answer_html",
          label: "Answer HTML",
          type: "textarea",
          required: true,
        },
        {
          key: "is_published",
          label: "Published",
          type: "boolean",
          defaultValue: true,
        },
      ],
    },
    list: {
      columns: [
        { key: "question", title: "Question", type: "text" },
        { key: "is_published", title: "Published", type: "boolean" },
        { key: "updated_at", title: "Updated", type: "datetime" },
      ],
    },
  },
  {
    name: "faq_translations",
    label: "FAQ Translations",
    routes: {
      list: "/admin/faq-translations",
      create: "/admin/faq-translations/create",
      edit: "/admin/faq-translations/edit/:id",
    },
    form: {
      fields: [
        {
          key: "faq_id",
          label: "FAQ",
          type: "select",
          relation: {
            resource: "faq",
            optionLabel: "question",
          },
          required: true,
        },
        {
          key: "locale",
          label: "Locale",
          type: "text",
          required: true,
        },
        {
          key: "question",
          label: "Question (Translated)",
          type: "text",
          required: true,
        },
        {
          key: "answer_html",
          label: "Answer HTML",
          type: "textarea",
          required: true,
        },
      ],
    },
    list: {
      columns: [
        { key: "faq_id", title: "FAQ ID", type: "text" },
        { key: "locale", title: "Locale", type: "text" },
        { key: "question", title: "Question", type: "text" },
      ],
    },
  },
];

export const RESOURCE_DEFINITION_MAP: Record<string, ResourceDefinition> =
  RESOURCE_DEFINITIONS.reduce((acc, definition) => {
    acc[definition.name] = definition;
    return acc;
  }, {} as Record<string, ResourceDefinition>);


