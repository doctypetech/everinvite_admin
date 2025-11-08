import { Create, useForm, useSelect } from "@refinedev/antd";
import { Alert, Form, Input, Select } from "antd";
import { useMemo } from "react";
import { useOrg } from "../../contexts/org";

export const EventTextsCreate = () => {
  const { activeMembership } = useOrg();
  const orgId = activeMembership?.orgId;
  const canManage = useMemo(
    () => ["owner", "admin", "editor"].includes(activeMembership?.role ?? ""),
    [activeMembership?.role]
  );

  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "event_texts",
    redirect: "list",
  });

  const { selectProps: eventSelectProps } = useSelect({
    resource: "events",
    optionLabel: "slug",
    optionValue: "id",
    filters: orgId
      ? [
          {
            field: "org_id",
            operator: "eq",
            value: orgId,
          },
        ]
      : [],
    queryOptions: {
      enabled: Boolean(orgId),
    },
  });

  const handleFinish = async (values: any) => {
    if (!canManage) {
      return false;
    }

    return onFinish?.(values);
  };

  if (!orgId) {
    return (
      <Alert
        type="info"
        message="No organization selected"
        description="Select an organization to manage event copy."
      />
    );
  }

  if (!canManage) {
    return (
      <Alert
        type="warning"
        message="Insufficient permissions"
        description="You need owner, admin, or editor access to create event copy."
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
        onFinish={handleFinish}
        initialValues={{
          locale: "en",
        }}
      >
        <Form.Item
          label="Event"
          name="event_id"
          rules={[{ required: true, message: "Event is required" }]}
        >
          <Select
            placeholder="Select event"
            {...eventSelectProps}
            disabled={!eventSelectProps.options?.length}
          />
        </Form.Item>

        <Form.Item
          label="Locale"
          name="locale"
          rules={[{ required: true, message: "Locale is required" }]}
        >
          <Select
            options={[
              { label: "English (en)", value: "en" },
              { label: "Arabic (ar)", value: "ar" },
              { label: "French (fr)", value: "fr" },
            ]}
            showSearch
          />
        </Form.Item>

        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="Event title" />
        </Form.Item>

        <Form.Item label="Body Copy" name="body_copy">
          <Input.TextArea rows={6} placeholder="Event description" />
        </Form.Item>
      </Form>
    </Create>
  );
};


