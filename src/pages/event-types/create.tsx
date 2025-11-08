import { Create, useForm } from "@refinedev/antd";
import { Alert, Form, Input, InputNumber } from "antd";
import { useOrg } from "../../contexts/org";

export const EventTypesCreate = () => {
  const { isPlatformAdmin } = useOrg();

  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "event_types",
    redirect: "list",
  });

  const handleFinish = async (values: any) => {
    if (!isPlatformAdmin) {
      return false;
    }

    return onFinish?.(values);
  };

  if (!isPlatformAdmin) {
    return (
      <Alert
        type="warning"
        message="Insufficient permissions"
        description="Only platform admins can create event types."
      />
    );
  }

  return (
    <Create
      saveButtonProps={{
        ...saveButtonProps,
        disabled: saveButtonProps.disabled || !isPlatformAdmin,
      }}
    >
      <Form
        {...formProps}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ sort_order: 0 }}
      >
        <Form.Item
          label="Key"
          name="key"
          rules={[
            { required: true, message: "Key is required" },
            {
              pattern: /^[a-z0-9-_]+$/,
              message: "Use lowercase letters, numbers, dashes, or underscores",
            },
          ]}
        >
          <Input placeholder="wedding" />
        </Form.Item>

        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input placeholder="Wedding" />
        </Form.Item>

        <Form.Item label="Sort Order" name="sort_order">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Create>
  );
};


