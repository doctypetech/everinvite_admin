import { Edit, useForm } from "@refinedev/antd";
import { Alert, Form, Input, InputNumber } from "antd";
import { usePlatformAccess } from "../../contexts/org";

export const EventTypesEdit = () => {
  const { isPlatformAdmin } = usePlatformAccess();

  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "event_types",
    redirect: "list",
    meta: {
      select: "id, key, name, sort_order",
    },
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
        description="Only platform admins can edit event types."
      />
    );
  }

  return (
    <Edit
      saveButtonProps={{
        ...saveButtonProps,
        disabled: saveButtonProps.disabled || !isPlatformAdmin,
      }}
    >
      <Form
        {...formProps}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={formProps.initialValues}
      >
        <Form.Item label="Key" name="key">
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Sort Order" name="sort_order">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Edit>
  );
};


