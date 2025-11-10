import { useSelect } from "@refinedev/antd";
import { DatePicker, Form, Input, InputNumber, Select, Switch } from "antd";
import type { FieldDefinition } from "../../config/resourceDefinitions";

type Mode = "create" | "edit";

type ResourceFieldProps = {
  field: FieldDefinition;
  mode: Mode;
};

const getFieldPlaceholder = (field: FieldDefinition) => {
  if (field.placeholder) {
    return field.placeholder;
  }

  if (typeof field.helperText === "string" && field.helperText.trim().length) {
    return field.helperText;
  }

  if (typeof field.defaultValue === "string" && field.defaultValue.trim().length) {
    return field.defaultValue;
  }

  const normalizedLabel = field.label.toLowerCase();

  switch (field.type) {
    case "json":
      return 'Enter JSON, e.g. {"key": "value"}';
    case "textarea":
    case "text":
      return `Enter ${normalizedLabel}`;
    case "number":
      return `Enter ${normalizedLabel}`;
    case "datetime":
      return `Select ${normalizedLabel}`;
    case "select":
      return `Select ${normalizedLabel}`;
    default:
      return undefined;
  }
};

export const ResourceField: React.FC<ResourceFieldProps> = ({
  field,
  mode,
}) => {
  const isDisabled =
    (mode === "create" && field.disabledOnCreate) ||
    (mode === "edit" && field.disabledOnEdit);

  const rules = field.required
    ? [
        {
          required: true,
          message: `${field.label} is required`,
        },
      ]
    : undefined;

  const placeholder = getFieldPlaceholder(field);

  if (field.type === "boolean") {
    return (
      <Form.Item
        key={field.key}
        name={field.key}
        label={field.label}
        valuePropName="checked"
        rules={rules}
        tooltip={field.helperText}
      >
        <Switch disabled={isDisabled} />
      </Form.Item>
    );
  }

  if (field.type === "number") {
    return (
      <Form.Item
        key={field.key}
        name={field.key}
        label={field.label}
        rules={rules}
        tooltip={field.helperText}
      >
        <InputNumber
          style={{ width: "100%" }}
          disabled={isDisabled}
          min={field.min}
          max={field.max}
          step={field.step}
          placeholder={placeholder}
        />
      </Form.Item>
    );
  }

  if (field.type === "datetime") {
    return (
      <Form.Item
        key={field.key}
        name={field.key}
        label={field.label}
        rules={rules}
        tooltip={field.helperText}
      >
        <DatePicker
          showTime
          style={{ width: "100%" }}
          disabled={isDisabled}
          placeholder={placeholder}
        />
      </Form.Item>
    );
  }

  if (field.type === "select") {
    if (field.relation) {
      const { selectProps } = useSelect({
        resource: field.relation.resource,
        optionLabel: field.relation.optionLabel as any,
        optionValue: (field.relation.optionValue ?? "id") as any,
        meta: field.relation.meta,
      });

      return (
        <Form.Item
          key={field.key}
          name={field.key}
          label={field.label}
          rules={rules}
          tooltip={field.helperText}
        >
          <Select
            {...selectProps}
            disabled={isDisabled}
            allowClear={!field.required}
            showSearch
            placeholder={selectProps.placeholder ?? placeholder}
          />
        </Form.Item>
      );
    }

    return (
      <Form.Item
        key={field.key}
        name={field.key}
        label={field.label}
        rules={rules}
        tooltip={field.helperText}
      >
        <Select
          disabled={isDisabled}
          allowClear={!field.required}
          options={field.enumValues}
          placeholder={placeholder}
        />
      </Form.Item>
    );
  }

  const isTextArea = field.type === "textarea" || field.type === "json";

  return (
    <Form.Item
      key={field.key}
      name={field.key}
      label={field.label}
      rules={rules}
      tooltip={field.helperText}
    >
      {isTextArea ? (
        <Input.TextArea
          rows={field.type === "json" ? 8 : 4}
          disabled={isDisabled}
          placeholder={placeholder}
        />
      ) : (
        <Input disabled={isDisabled} placeholder={placeholder} />
      )}
    </Form.Item>
  );
};


