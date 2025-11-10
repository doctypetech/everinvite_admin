import { Create, useForm, useSelect } from "@refinedev/antd";
import { Alert, Form, Select } from "antd";
import { useOrg } from "../../contexts/org";

export const PlatformAdminsCreate = () => {
  const { isPlatformAdmin } = useOrg();

  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "platform_admins",
    redirect: "list",
  });

  const { selectProps: userSelectProps } = useSelect({
    resource: "user_email",
    optionLabel: "email",
    optionValue: "user_id",
    debounce: 300,
    pagination: {
      pageSize: 50,
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
          label="Email"
          name="user_id"
          rules={[{ required: true, message: "Email is required" }]}
        >
          <Select
            placeholder="Select user email"
            showSearch
            optionFilterProp="label"
            {...userSelectProps}
          />
        </Form.Item>
      </Form>
    </Create>
  );
};


