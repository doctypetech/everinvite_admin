import dayjs from "dayjs";
import type {
  FieldDefinition,
  FieldType,
  ResourceDefinition,
} from "../../config/resourceDefinitions";
import { RESOURCE_DEFINITION_MAP } from "../../config/resourceDefinitions";
import {
  RESOURCE_GROUP_DEFINITION_MAP,
  RESOURCE_GROUP_NAME_BY_RESOURCE,
} from "../../config/resourceGroups";

const isRecord = (value: unknown): value is Record<string, any> =>
  typeof value === "object" && value !== null;

export const formatCellValue = (
  value: unknown,
  type: FieldType | undefined
): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  switch (type) {
    case "datetime":
      return dayjs(value as any).isValid()
        ? dayjs(value as any).format("YYYY-MM-DD HH:mm")
        : String(value);
    case "boolean":
      return Boolean(value) ? "Yes" : "No";
    case "json":
      try {
        return JSON.stringify(
          typeof value === "string" ? JSON.parse(value) : value,
          null,
          2
        );
      } catch {
        return String(value);
      }
    case "image":
      return typeof value === "string" && value.trim().length > 0
        ? value
        : "-";
    default:
      return String(value);
  }
};

export const convertInitialValues = (
  values: Record<string, unknown> | undefined,
  fields: FieldDefinition[]
): Record<string, unknown> | undefined => {
  if (!values) {
    return values;
  }

  const clone: Record<string, unknown> = { ...values };

  fields.forEach((field) => {
    const value = clone[field.key];

    if (value === undefined || value === null) {
      if (field.defaultValue !== undefined) {
        clone[field.key] = field.defaultValue;
      }
      return;
    }

    switch (field.type) {
      case "datetime":
        clone[field.key] = dayjs(value as any);
        break;
      case "json":
        try {
          clone[field.key] =
            typeof value === "string"
              ? value
              : JSON.stringify(value, null, 2);
        } catch {
          clone[field.key] = String(value);
        }
        break;
      case "themeColors": {
        const defaultConfig =
          field.defaultValue && isRecord(field.defaultValue)
            ? field.defaultValue
            : {};

        let configValue: Record<string, any>;

        if (typeof value === "string") {
          try {
            configValue = JSON.parse(value);
          } catch {
            configValue = {};
          }
        } else if (isRecord(value)) {
          configValue = { ...value };
        } else {
          configValue = {};
        }

        const defaultTheme = isRecord(defaultConfig.theme)
          ? defaultConfig.theme
          : {};
        const defaultColors = isRecord(defaultTheme.colors)
          ? defaultTheme.colors
          : {};
        const existingTheme = isRecord(configValue.theme)
          ? configValue.theme
          : {};
        const existingColors = isRecord(existingTheme.colors)
          ? existingTheme.colors
          : {};

        const ensureColor = (
          colorValue: unknown,
          fallback: string | undefined
        ) => {
          if (typeof colorValue === "string" && colorValue.trim().length > 0) {
            return colorValue.trim();
          }
          if (typeof fallback === "string" && fallback.trim().length > 0) {
            return fallback.trim();
          }
          return "#000000";
        };

        const preparedColors = {
          primary: ensureColor(
            existingColors.primary,
            defaultColors.primary as string | undefined
          ),
          secondary: ensureColor(
            existingColors.secondary,
            defaultColors.secondary as string | undefined
          ),
          main: ensureColor(
            existingColors.main,
            defaultColors.main as string | undefined
          ),
        };

        clone[field.key] = {
          ...configValue,
          theme: {
            ...(defaultTheme ?? {}),
            ...(existingTheme ?? {}),
            colors: {
              ...(defaultColors ?? {}),
              ...preparedColors,
            },
          },
        };
        break;
      }
      default:
        break;
    }
  });

  return clone;
};

export const serializeFormValues = (
  values: Record<string, unknown>,
  fields: FieldDefinition[]
): Record<string, unknown> => {
  const output: Record<string, unknown> = { ...values };

  fields.forEach((field) => {
    const rawValue = output[field.key];

    if (rawValue === undefined) {
      return;
    }

    switch (field.type) {
      case "number": {
        if (rawValue === "" || rawValue === null) {
          output[field.key] = null;
        } else {
          const parsed = Number(rawValue);
          output[field.key] = Number.isNaN(parsed) ? null : parsed;
        }
        break;
      }
      case "boolean": {
        output[field.key] = Boolean(rawValue);
        break;
      }
      case "json": {
        const stringValue =
          typeof rawValue === "string" ? rawValue.trim() : String(rawValue);

        if (!stringValue.length) {
          output[field.key] = null;
          break;
        }

        try {
          output[field.key] =
            typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;
        } catch (error) {
          throw new Error(
            `${field.label}: Invalid JSON - ${String((error as Error).message)}`
          );
        }
        break;
      }
      case "datetime": {
        if (!rawValue) {
          output[field.key] = null;
        } else if (dayjs.isDayjs(rawValue)) {
          output[field.key] = rawValue.toISOString();
        } else {
          output[field.key] = dayjs(rawValue as any).toISOString();
        }
        break;
      }
      case "themeColors": {
        const defaultConfig =
          field.defaultValue && isRecord(field.defaultValue)
            ? field.defaultValue
            : {};

        const value = rawValue && isRecord(rawValue) ? rawValue : {};

        const existingTheme = isRecord(value.theme) ? value.theme : {};
        const existingColors = isRecord(existingTheme.colors)
          ? existingTheme.colors
          : {};
        const defaultTheme = isRecord(defaultConfig.theme)
          ? defaultConfig.theme
          : {};
        const defaultColors = isRecord(defaultTheme.colors)
          ? defaultTheme.colors
          : {};

        const normalizeColor = (
          colorValue: unknown,
          fallback: string | undefined
        ) => {
          if (typeof colorValue === "string" && colorValue.trim().length > 0) {
            return colorValue.trim();
          }
          if (typeof fallback === "string" && fallback.trim().length > 0) {
            return fallback.trim();
          }
          return "#000000";
        };

        const normalizedTheme = {
          ...(isRecord(value.theme) ? value.theme : {}),
          colors: {
            primary: normalizeColor(
              existingColors.primary,
              defaultColors.primary as string | undefined
            ),
            secondary: normalizeColor(
              existingColors.secondary,
              defaultColors.secondary as string | undefined
            ),
            main: normalizeColor(
              existingColors.main,
              defaultColors.main as string | undefined
            ),
          },
        };

        output[field.key] = {
          ...value,
          theme: normalizedTheme,
        };
        break;
      }
      case "image": {
        if (rawValue === undefined || rawValue === null || rawValue === "") {
          output[field.key] = null;
        } else {
          output[field.key] = rawValue;
        }
        break;
      }
      default:
        break;
    }
  });

  return output;
};

export const resolveOrgFilterField = (
  definition?: ResourceDefinition
): string | undefined => {
  if (!definition) {
    return undefined;
  }

  if (definition.orgFilterField) {
    return definition.orgFilterField;
  }

  const hasOrganizationField = definition.form.fields.some(
    (field) => field.key === "organization_id"
  );

  return hasOrganizationField ? "organization_id" : undefined;
};

type OrganizationRelatedResource = {
  resource: string;
  label: string;
};

export const ORGANIZATION_RELATED_RESOURCES: OrganizationRelatedResource[] = [
  { resource: "invitees", label: "Invitees" },
  { resource: "organization_content", label: "Content" },
  { resource: "trivia_questions", label: "Trivia" },
  { resource: "trivia_options", label: "Trivia" },
  { resource: "trivia_answers", label: "Trivia" },
  { resource: "trivia_question_translations", label: "Trivia" },
  { resource: "trivia_option_translations", label: "Trivia" },
];

export const ORGANIZATION_RELATED_RESOURCE_NAMES = new Set(
  ORGANIZATION_RELATED_RESOURCES.map(({ resource }) => resource)
);

export const ORGANIZATION_RELATED_GROUP_NAMES = new Set([
  "organization-content",
  "invitees",
]);

export const TRIVIA_RESOURCE_NAMES = new Set<string>([
  "trivia_questions",
  "trivia_options",
  "trivia_answers",
  "trivia_question_translations",
  "trivia_option_translations",
]);

export const buildOrganizationResourceListUrl = (
  resourceName: string,
  organizationId: string | number
): string | undefined => {
  const definition = RESOURCE_DEFINITION_MAP[resourceName];

  if (!definition) {
    return undefined;
  }

  const listPath = definition.routes.list;
  const filterField = resolveOrgFilterField(definition);

  if (!listPath || !filterField) {
    return undefined;
  }

  const params = new URLSearchParams();
  params.set("filters[0][field]", filterField);
  params.set("filters[0][operator]", "eq");
  params.set("filters[0][value]", String(organizationId));
  params.set("organizationId", String(organizationId));

  return `${listPath}?${params.toString()}`;
};

export const buildOrganizationGroupUrl = (
  groupName: string,
  organizationId: string | number,
  targetResource?: string
): string | undefined => {
  const groupDefinition = RESOURCE_GROUP_DEFINITION_MAP[groupName];

  if (!groupDefinition) {
    return undefined;
  }

  const fallbackResource = groupDefinition.sections[0]?.resource;
  const resourceName = targetResource ?? fallbackResource;

  if (!resourceName) {
    return undefined;
  }

  const sectionDefinition = RESOURCE_DEFINITION_MAP[resourceName];
  const filterField = resolveOrgFilterField(sectionDefinition);

  if (!filterField) {
    return undefined;
  }

  const params = new URLSearchParams();
  params.set("filters[0][field]", filterField);
  params.set("filters[0][operator]", "eq");
  params.set("filters[0][value]", String(organizationId));
  params.set("organizationId", String(organizationId));

  if (targetResource && targetResource !== fallbackResource) {
    params.set("tab", targetResource);
  } else if (!targetResource && fallbackResource) {
    params.delete("tab");
  }

  if (targetResource && TRIVIA_RESOURCE_NAMES.has(targetResource)) {
    params.set("view", "trivia");
  } else {
    params.delete("view");
  }

  return `${groupDefinition.route}?${params.toString()}`;
};

export const resolveResourceGroupForResource = (
  resourceName: string | undefined
): string | undefined => {
  if (!resourceName) {
    return undefined;
  }

  return RESOURCE_GROUP_NAME_BY_RESOURCE[resourceName];
};


