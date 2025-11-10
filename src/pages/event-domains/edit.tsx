import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Alert, Form, Input, Select } from "antd";
import { usePlatformAccess } from "../../contexts/org";

export const EventDomainsEdit = () => {
  const { isPlatformAdmin, loading } = usePlatformAccess();
  const canManage = isPlatformAdmin;

  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "event_domains",
    redirect: "list",
    meta: {
      select: "host, event_id",
    },
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
        description="Only platform admins can edit domains."
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
        <Form.Item label="Host" name="host">
          <Input disabled />
        </Form.Item>
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
      </Form>
    </Edit>
  );
};


