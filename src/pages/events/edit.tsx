import { Edit, useForm } from "@refinedev/antd";
import { useOne } from "@refinedev/core";
import {
  Alert,
  DatePicker,
  Form,
  Input,
  Select,
  Switch,
  TimePicker,
} from "antd";
import dayjs from "dayjs";
import { useMemo } from "react";
import { useOrg } from "../../contexts/org";
import { useSelect } from "@refinedev/antd";

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Live", value: "live" },
  { label: "Archived", value: "archived" },
];

export const EventsEdit = () => {
  const { activeMembership } = useOrg();
  const orgId = activeMembership?.orgId;
  const canManage = useMemo(
    () => ["owner", "admin", "editor"].includes(activeMembership?.role ?? ""),
    [activeMembership?.role]
  );

  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "events",
    redirect: "list",
    meta: {
      select:
        "id, org_id, slug, template_id, theme_id, status, variant, date, time, venue, map_link, hero_image_url, custom_label, show_guest_gallery",
    },
  });

  const watchedTemplateId = Form.useWatch("template_id", formProps.form);
  const currentTemplateId =
    watchedTemplateId ?? formProps.initialValues?.template_id;

  const { selectProps: templateSelectProps } = useSelect({
    resource: "templates",
    optionLabel: "name",
    optionValue: "id",
  });

  const { selectProps: themeSelectProps } = useSelect({
    resource: "themes",
    optionLabel: "name",
    optionValue: "id",
    filters: currentTemplateId
      ? [
          {
            field: "template_id",
            operator: "eq",
            value: currentTemplateId,
          },
        ]
      : [],
    queryOptions: {
      enabled: Boolean(currentTemplateId),
    },
  });

  const { result: templateRecord } = useOne({
    resource: "templates",
    id: currentTemplateId,
    queryOptions: {
      enabled: Boolean(currentTemplateId),
    },
    meta: {
      select: "id, supported_variants",
    },
  });

  const variantOptions =
    ((templateRecord as any)?.supported_variants as string[] | null)?.map(
      (value) => ({ label: value, value })
    ) ?? [];

  const initialValues = useMemo(() => {
    const values = formProps.initialValues ?? {};

    return {
      ...values,
      date: values?.date ? dayjs(values.date) : undefined,
      time: values?.time ? dayjs(values.time, "HH:mm:ss") : undefined,
    };
  }, [formProps.initialValues]);

  const handleFinish = async (values: any) => {
    const resolvedOrgId =
      values.org_id ?? formProps.initialValues?.org_id ?? orgId;

    const payload = {
      ...values,
      org_id: resolvedOrgId,
      date: values.date ? values.date.format("YYYY-MM-DD") : null,
      time: values.time ? values.time.format("HH:mm:ss") : null,
    };

    return onFinish?.(payload);
  };

  if (!orgId) {
    return (
      <Alert
        type="info"
        message="No organization selected"
        description="Select an organization to manage events."
      />
    );
  }

  if (!canManage) {
    return (
      <Alert
        type="warning"
        message="Insufficient permissions"
        description="You need owner, admin, or editor access to edit events."
      />
    );
  }

  return (
    <Edit
      saveButtonProps={{
        ...saveButtonProps,
        disabled: saveButtonProps.disabled || !canManage,
      }}
    >
      <Form
        {...formProps}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={initialValues}
      >
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
          <Input placeholder="sam-lina-2025" disabled />
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
            disabled
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
            disabled={!currentTemplateId}
          />
        </Form.Item>

        <Form.Item label="Variant" name="variant">
          <Select
            placeholder={
              variantOptions.length
                ? "Select variant supported by template"
                : "Leave blank to use template default"
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
    </Edit>
  );
};


