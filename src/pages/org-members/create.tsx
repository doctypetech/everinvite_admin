import { Create, useForm, useSelect } from "@refinedev/antd";
import { Alert, Form, Select } from "antd";
import { useOrg } from "../../contexts/org";

const ROLE_OPTIONS = [
  { label: "Owner", value: "owner" },
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
  { label: "Viewer", value: "viewer" },
];

export const OrgMembersCreate = () => {
  const { isPlatformAdmin } = useOrg();

  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "org_members",
    redirect: "list",
  });

  const { selectProps: orgSelectProps } = useSelect({
    resource: "orgs",
    optionLabel: "name",
    optionValue: "id",
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
        description="Only platform admins can add org members."
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
        initialValues={{
          role: "admin",
        }}
      >
        <Form.Item
          label="Organization"
          name="org_id"
          rules={[{ required: true, message: "Organization is required" }]}
        >
          <Select
            placeholder="Select organization"
            {...orgSelectProps}
          />
        </Form.Item>

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

        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Role is required" }]}
        >
          <Select options={ROLE_OPTIONS} />
        </Form.Item>
      </Form>
    </Create>
  );
};


