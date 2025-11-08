import { Create, useForm } from "@refinedev/antd";
import { Alert, Form, Input } from "antd";
import { useOrg } from "../../contexts/org";

export const PlatformAdminsCreate = () => {
  const { isPlatformAdmin } = useOrg();

  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "platform_admins",
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
        description="Only platform admins can add other platform admins."
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
      >
        <Form.Item
          label="User ID"
          name="user_id"
          rules={[{ required: true, message: "User ID is required" }]}
        >
          <Input placeholder="Supabase auth.users UUID" />
        </Form.Item>
      </Form>
    </Create>
  );
};


