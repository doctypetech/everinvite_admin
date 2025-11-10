import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Alert, Form, Select } from "antd";
import { useParams } from "react-router";
import { useOrg } from "../../contexts/org";

const ROLE_OPTIONS = [
  { label: "Owner", value: "owner" },
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
  { label: "Viewer", value: "viewer" },
];

export const OrgMembersEdit = () => {
  const { isPlatformAdmin } = useOrg();
  const { id } = useParams<{ id: string }>();

  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "org_members",
    redirect: "list",
    id,
    meta: {
      select: "org_id, user_id, role",
    },
  });

  const { selectProps: orgSelectProps } = useSelect({
    resource: "orgs",
    optionLabel: "name",
    optionValue: "id",
  });

  const { selectProps: userSelectProps } = useSelect({
    resource: "user_emails",
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
        description="Only platform admins can edit org members."
      />
    );
  }

  if (!id) {
    return (
      <Alert
        type="error"
        message="Invalid record"
        description="Missing membership identifier."
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
        <Form.Item label="Organization" name="org_id">
          <Select {...orgSelectProps} disabled />
        </Form.Item>
        <Form.Item label="Email" name="user_id">
          <Select {...userSelectProps} disabled showSearch optionFilterProp="label" />
        </Form.Item>
        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Role is required" }]}
        >
          <Select options={ROLE_OPTIONS} />
        </Form.Item>
      </Form>
    </Edit>
  );
};


