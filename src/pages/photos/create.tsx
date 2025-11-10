import { Create, useForm, useSelect } from "@refinedev/antd";
import { Alert, Form, Input, InputNumber, Select } from "antd";
import { usePlatformAccess } from "../../contexts/org";

const STATUS_OPTIONS = [
  { label: "Visible", value: "visible" },
  { label: "Hidden", value: "hidden" },
  { label: "Deleted", value: "deleted" },
];

export const PhotosCreate = () => {
  const { isPlatformAdmin, loading } = usePlatformAccess();
  const canManage = isPlatformAdmin;

  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "photos",
    redirect: "list",
  });

  const { selectProps: eventSelectProps } = useSelect({
    resource: "events",
    optionLabel: "slug",
    optionValue: "id",
    queryOptions: {
      enabled: !loading,
    },
  });

  const handleFinish = async (values: any) => {
    if (!canManage) {
      return false;
    }

    return onFinish?.(values);
  };

  if (!canManage) {
    return (
      <Alert
        type="warning"
        message="Insufficient permissions"
        description="Only platform admins can add photos."
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
        initialValues={{ status: "visible" }}
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
    </Create>
  );
};


