import { Create, useForm, useSelect } from "@refinedev/antd";
import { Alert, Form, Input, Select } from "antd";
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
          label="User ID"
          name="user_id"
          rules={[{ required: true, message: "User ID is required" }]}
        >
          <Input placeholder="Supabase auth.users UUID" />
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


