import { Create, useForm, useSelect } from "@refinedev/antd";
import { Alert, DatePicker, Form, Input, InputNumber, Select } from "antd";
import dayjs from "dayjs";
import { usePlatformAccess } from "../../contexts/org";

export const UploadTokensCreate = () => {
  const { isPlatformAdmin, loading } = usePlatformAccess();
  const canManage = isPlatformAdmin;

  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "upload_tokens",
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

    const payload = {
      ...values,
      expires_at: values.expires_at
        ? values.expires_at.toISOString()
        : dayjs().add(7, "day").toISOString(),
      used_count: values.used_count ?? 0,
    };

    return onFinish?.(payload);
  };

  if (!canManage) {
    return (
      <Alert
        type="warning"
        message="Insufficient permissions"
        description="Only platform admins can create upload tokens."
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
          max_uploads: 100,
          used_count: 0,
          expires_at: dayjs().add(7, "day"),
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
          label="Token"
          name="token"
          rules={[{ required: true, message: "Token is required" }]}
        >
          <Input placeholder="Unique token value" />
        </Form.Item>

        <Form.Item
          label="Expires At"
          name="expires_at"
          rules={[{ required: true, message: "Expiry date is required" }]}
        >
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Max Uploads"
          name="max_uploads"
          rules={[{ required: true, message: "Max uploads is required" }]}
        >
          <InputNumber style={{ width: "100%" }} min={1} />
        </Form.Item>

        <Form.Item label="Used Count" name="used_count">
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>
      </Form>
    </Create>
  );
};


