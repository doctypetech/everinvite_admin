import { useSelect } from "@refinedev/antd";
import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Tabs,
  TimePicker,
  Tooltip,
} from "antd";
import type { FieldDefinition } from "../../config/resourceDefinitions";

import React from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import { RichTextEditor } from "../../components/RichTextEditor";

type Mode = "create" | "edit";

type ResourceFieldProps = {
  field: FieldDefinition;
  mode: Mode;
  lockedValue?: unknown;
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
    case "richtext":
      return `Enter ${normalizedLabel}`;
    case "number":
      return `Enter ${normalizedLabel}`;
    case "date":
      return `Select ${normalizedLabel}`;
    case "time":
      return `Select ${normalizedLabel}`;
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
  lockedValue,
}) => {
  const isLocked = lockedValue !== undefined;
  const isDisabled =
    isLocked ||
    (mode === "create" && !!field.disabledOnCreate) ||
    (mode === "edit" && !!field.disabledOnEdit);

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

  if (field.type === "date") {
    return (
      <Form.Item
        key={field.key}
        name={field.key}
        label={field.label}
        rules={rules}
        tooltip={field.helperText}
      >
        <DatePicker
          style={{ width: "100%" }}
          disabled={isDisabled}
          placeholder={placeholder}
        />
      </Form.Item>
    );
  }

  if (field.type === "time") {
    return (
      <Form.Item
        key={field.key}
        name={field.key}
        label={field.label}
        rules={rules}
        tooltip={field.helperText}
      >
        <TimePicker
          style={{ width: "100%" }}
          disabled={isDisabled}
          format="HH:mm"
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
        defaultValue: lockedValue as any,
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
            allowClear={!field.required && !isLocked}
            showSearch={!isLocked}
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
          allowClear={!field.required && !isLocked}
          options={field.enumValues}
          placeholder={placeholder}
        />
      </Form.Item>
    );
  }

  if (field.type === "themeColors") {
    const colorFields = [
      { key: "main", label: "Main" },
      { key: "primary", label: "Primary" },
      { key: "secondary", label: "Secondary" },
    ];

    return (
      <Form.Item
        key={field.key}
        label={field.label}
        colon={true}
        style={{ marginBottom: 0 }}
      >
        <Tabs
          size="small"
          items={[
            {
              key: "theme-colors",
              label: (
                <Space size={4}>
                  Colors
                  <Tooltip title="Customize the primary, secondary, and main colors used across this organization.">
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              ),
              children: (
                <Space size={16} style={{ width: "100%" }} align="center" wrap>
                  {colorFields.map((colorField) => (
                    <Space key={colorField.key} direction="horizontal" size={8}>
                      <span style={{ minWidth: 70 }}>{colorField.label}</span>
                      <Form.Item
                        name={[field.key, "theme", "colors", colorField.key]}
                        rules={[
                          {
                            required: true,
                            message: `${colorField.label} color is required`,
                          },
                        ]}
                        colon={false}
                        style={{ marginBottom: 0 }}
                      >
                        <Input
                          type="color"
                          disabled={isDisabled}
                          style={{
                            width: 28,
                            height: 28,
                            padding: 0,
                            borderRadius: 4,
                            border: "1px solid #d9d9d9",
                            background: "transparent",
                          }}
                        />
                      </Form.Item>
                    </Space>
                  ))}
                </Space>
              ),
            },
          ]}
        />
      </Form.Item>
    );
  }

  const isTextArea = field.type === "textarea" || field.type === "json";
  if (field.type === "richtext") {
    return (
      <Form.Item
        key={field.key}
        name={field.key}
        label={field.label}
        rules={rules}
        tooltip={field.helperText}
      >
        <RichTextEditor disabled={isDisabled} />
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


