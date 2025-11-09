import dayjs from "dayjs";
import type {
  FieldDefinition,
  FieldType,
} from "../../config/resourceDefinitions";

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
      default:
        break;
    }
  });

  return output;
};


