import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Alert, Form, Input, InputNumber, Select } from "antd";
import { useMemo } from "react";
import { useOrg } from "../../contexts/org";

const STATUS_OPTIONS = [
  { label: "Visible", value: "visible" },
  { label: "Hidden", value: "hidden" },
  { label: "Deleted", value: "deleted" },
];

export const PhotosEdit = () => {
  const { activeMembership } = useOrg();
  const orgId = activeMembership?.orgId;
  const canManage = useMemo(
    () => ["owner", "admin", "editor"].includes(activeMembership?.role ?? ""),
    [activeMembership?.role]
  );

  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "photos",
    redirect: "list",
    meta: {
      select: "id, event_id, file_url, width, height, status",
    },
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
        description="Select an organization to manage photos."
      />
    );
  }

  if (!canManage) {
    return (
      <Alert
        type="warning"
        message="Insufficient permissions"
        description="You need owner, admin, or editor access to edit photos."
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
        initialValues={formProps.initialValues}
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
          label="File URL"
          name="file_url"
          rules={[{ required: true, message: "File URL is required" }]}
        >
          <Input placeholder="guest-photos/.../1.jpg" />
        </Form.Item>

        <Form.Item label="Width" name="width">
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item label="Height" name="height">
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: "Status is required" }]}
        >
          <Select options={STATUS_OPTIONS} />
        </Form.Item>
      </Form>
    </Edit>
  );
};


