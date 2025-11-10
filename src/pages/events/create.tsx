import { Create, useForm } from "@refinedev/antd";
import { useOne } from "@refinedev/core";
import {
  Alert,
  Form,
  Input,
  Select,
  Switch,
  DatePicker,
  TimePicker,
} from "antd";
import dayjs from "dayjs";
import { useMemo } from "react";
import { useSelect } from "@refinedev/antd";
import { usePlatformAccess } from "../../contexts/org";

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Live", value: "live" },
  { label: "Archived", value: "archived" },
];

export const EventsCreate = () => {
  const { isPlatformAdmin, loading } = usePlatformAccess();
  const canManage = isPlatformAdmin;

  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "events",
    redirect: "list",
    meta: {
      select:
        "id, org_id, slug, template_id, theme_id, status, variant, date, time, venue, map_link, hero_image_url, custom_label, show_guest_gallery",
    },
    queryOptions: {
      enabled: false,
    },
  });

  const { selectProps: templateSelectProps } = useSelect({
    resource: "templates",
    optionLabel: "name",
    optionValue: "id",
  });

  const templateId = Form.useWatch("template_id", formProps.form);

  const { selectProps: themeSelectProps } = useSelect({
    resource: "themes",
    optionLabel: "name",
    optionValue: "id",
    filters: templateId
      ? [
          {
            field: "template_id",
            operator: "eq",
            value: templateId,
          },
        ]
      : [],
    queryOptions: {
      enabled: Boolean(templateId),
    },
  });

  const { selectProps: orgSelectProps } = useSelect({
    resource: "organizations",
    optionLabel: "name",
    optionValue: "id",
    queryOptions: {
      enabled: !loading,
    },
  });

  const { result: templateRecord } = useOne({
    resource: "templates",
    id: templateId,
    queryOptions: {
      enabled: Boolean(templateId),
    },
    meta: {
      select: "id, supported_variants",
    },
  });

  const variantOptions =
    ((templateRecord as any)?.supported_variants as string[] | null)?.map(
      (value) => ({ label: value, value })
    ) ?? [];

  const initialValues = useMemo(
    () => ({
      status: "live",
      show_guest_gallery: true,
      ...(formProps.initialValues ?? {}),
      date: formProps.initialValues?.date
        ? dayjs(formProps.initialValues.date)
        : undefined,
      time: formProps.initialValues?.time
        ? dayjs(formProps.initialValues.time, "HH:mm:ss")
        : undefined,
    }),
    [formProps.initialValues]
  );

  const handleFinish = async (values: any) => {
    if (!canManage) {
      return false;
    }

    if (!values.org_id) {
      return false;
    }

    const payload = {
      ...values,
      date: values.date ? values.date.format("YYYY-MM-DD") : null,
      time: values.time ? values.time.format("HH:mm:ss") : null,
    };

    return onFinish?.(payload);
  };

  if (!canManage) {
    return (
      <Alert
        type="warning"
        message="Insufficient permissions"
        description="Only platform admins can create events."
      />
    );
  }

  return (
    <Create
      saveButtonProps={{
        ...saveButtonProps,
        disabled: saveButtonProps.disabled || !canManage,
      }}
    >
      <Form
        {...formProps}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleFinish}
      >
        <Form.Item
          label="Organization"
          name="org_id"
          rules={[{ required: true, message: "Organization is required" }]}
        >
          <Select
            placeholder="Select organization"
            {...orgSelectProps}
            loading={orgSelectProps.loading}
          />
        </Form.Item>

        <Form.Item
          label="Slug"
          name="slug"
          rules={[
            { required: true, message: "Slug is required" },
            {
              pattern: /^[a-z0-9-]+$/,
              message: "Use lowercase letters, numbers, and hyphens only",
            },
          ]}
        >
          <Input placeholder="sam-lina-2025" />
        </Form.Item>

        <Form.Item
          label="Template"
          name="template_id"
          rules={[{ required: true, message: "Template is required" }]}
        >
          <Select
            placeholder="Select template"
            {...templateSelectProps}
            allowClear={false}
          />
        </Form.Item>

        <Form.Item
          label="Theme"
          name="theme_id"
          dependencies={["template_id"]}
          rules={[{ required: true, message: "Theme is required" }]}
        >
          <Select
            placeholder="Select theme"
            {...themeSelectProps}
            disabled={!templateId}
          />
        </Form.Item>

        <Form.Item label="Variant" name="variant">
          <Select
            placeholder={
              variantOptions.length
                ? "Select variant supported by template"
                : "Enter variant key"
            }
            options={variantOptions}
            allowClear
            showSearch
            disabled={!variantOptions.length}
          />
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: "Status is required" }]}
        >
          <Select options={STATUS_OPTIONS} />
        </Form.Item>

        <Form.Item
          label="Date"
          name="date"
          rules={[{ required: true, message: "Event date is required" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Time"
          name="time"
          rules={[{ required: true, message: "Event time is required" }]}
        >
          <TimePicker style={{ width: "100%" }} format="HH:mm" />
        </Form.Item>

        <Form.Item
          label="Venue"
          name="venue"
          rules={[{ required: true, message: "Venue is required" }]}
        >
          <Input placeholder="Beit Al Founoun, Beirut" />
        </Form.Item>

        <Form.Item label="Map Link" name="map_link">
          <Input placeholder="https://maps.google.com/..." />
        </Form.Item>

        <Form.Item label="Hero Image URL" name="hero_image_url">
          <Input placeholder="event-assets/.../hero.jpg" />
        </Form.Item>

        <Form.Item label="Custom Label" name="custom_label">
          <Input placeholder="Save the Date" />
        </Form.Item>

        <Form.Item
          label="Show Guest Gallery"
          name="show_guest_gallery"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Create>
  );
};


