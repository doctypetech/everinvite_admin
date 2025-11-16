import { useSelect } from "@refinedev/antd";
import { useList } from "@refinedev/core";
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

import React, { useEffect, useMemo } from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import { RichTextEditor } from "../../components/RichTextEditor";
import { AVAILABLE_LOCALES } from "../../config/locales";
import { ImageUpload } from "../../components/ImageUpload";

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
    case "locale":
      return "Select locale";
    default:
      return undefined;
  }
};

export const ResourceField: React.FC<ResourceFieldProps> = ({
  field,
  mode,
  lockedValue,
}) => {
  const form = Form.useFormInstance();
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

  // Get organization_id and record id for image uploads
  const organizationId = Form.useWatch(
    field.storage?.organizationField || "organization_id",
    form
  ) as string | undefined;
  
  const recordId = Form.useWatch("id", form) as string | undefined;

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
      // Special handling for slide_type_id: filter out "default" and set it as default value
      const isSlideTypeField = field.key === "slide_type_id" && field.relation.resource === "slide_types";
      
      const { selectProps } = useSelect({
        resource: field.relation.resource,
        optionLabel: field.relation.optionLabel as any,
        optionValue: (field.relation.optionValue ?? "id") as any,
        meta: field.relation.meta,
        defaultValue: lockedValue as any,
      });

      // Fetch slide types to get the "default" ID
      const { data: slideTypesData } = useList({
        resource: "slide_types",
        queryOptions: {
          enabled: isSlideTypeField,
        },
      });

      const defaultSlideTypeId = useMemo(() => {
        if (!isSlideTypeField || !slideTypesData?.data) {
          return undefined;
        }
        const defaultType = slideTypesData.data.find(
          (item: Record<string, any>) => item.name === "default"
        );
        return defaultType?.id;
      }, [isSlideTypeField, slideTypesData?.data]);

      // Get current form value
      const currentFormValue = Form.useWatch(field.key, form);

      // Filter out "default" from options, but include it if it's the current value (for edit mode)
      const filteredOptions = useMemo(() => {
        if (!isSlideTypeField || !selectProps.options || !slideTypesData?.data) {
          return selectProps.options;
        }
        // Filter based on the actual slide types data
        const defaultTypeId = defaultSlideTypeId;
        const currentValue = currentFormValue;
        
        return selectProps.options.filter(
          (option: any) => {
            // Keep the option if it's not the default type, OR if it's the current value (for edit mode)
            return option.value !== defaultTypeId || option.value === currentValue;
          }
        );
      }, [isSlideTypeField, selectProps.options, slideTypesData?.data, defaultSlideTypeId, currentFormValue]);

      // Set default value if slide_type_id is null/undefined (for create mode)
      useEffect(() => {
        if (isSlideTypeField && defaultSlideTypeId && form) {
          const currentValue = form.getFieldValue(field.key);
          if (currentValue === null || currentValue === undefined) {
            form.setFieldValue(field.key, defaultSlideTypeId);
          }
        }
      }, [isSlideTypeField, defaultSlideTypeId, form, field.key]);

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
            options={isSlideTypeField ? filteredOptions : selectProps.options}
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
  if (field.type === "locale") {
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
          showSearch
          options={AVAILABLE_LOCALES}
          optionFilterProp="label"
          filterOption={(input, option) => {
            const label = String(option?.label ?? "");
            const value = String(option?.value ?? "");
            const normalizedInput = input.trim().toLowerCase();
            return (
              label.toLowerCase().includes(normalizedInput) ||
              value.toLowerCase().includes(normalizedInput)
            );
          }}
          placeholder={placeholder ?? "Select locale"}
        />
      </Form.Item>
    );
  }
  if (field.type === "primaryButton") {
    const textRules =
      field.required
        ? [
            {
              required: true,
              message: "Button text is required",
            },
          ]
        : undefined;
    const linkRules = [
      ...(field.required
        ? [
            {
              required: true,
              message: "Button link is required",
            },
          ]
        : []),
      {
        validator: (_: unknown, value: unknown) => {
          if (!value || typeof value !== "string" || value.trim().length === 0) {
            return Promise.resolve();
          }
          try {
            // eslint-disable-next-line no-new
            new URL(value);
            return Promise.resolve();
          } catch {
            return Promise.reject(
              new Error("Enter a valid URL (https://example.com)"),
            );
          }
        },
      },
    ];

    return (
      <Form.Item
        key={field.key}
        label={field.label}
        required={field.required}
        tooltip={field.helperText}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Form.Item
            name={[field.key, "text"]}
            label="Text"
            rules={textRules}
            colon={false}
          >
            <Input
              disabled={isDisabled}
              placeholder={placeholder ?? "Enter button text (e.g. RSVP Now)"}
            />
          </Form.Item>
          <Form.Item
            name={[field.key, "action_link"]}
            label="Link"
            rules={linkRules}
            colon={false}
          >
            <Input disabled={isDisabled} placeholder="https://example.com" />
          </Form.Item>
        </Space>
      </Form.Item>
    );
  }
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

  if (field.type === "image") {
    return (
      <Form.Item
        key={field.key}
        name={field.key}
        label={field.label}
        rules={rules}
        tooltip={field.helperText}
      >
        <ImageUpload
          field={field}
          disabled={isDisabled}
          organizationId={organizationId}
          recordId={recordId}
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


