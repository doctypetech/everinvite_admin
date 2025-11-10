import { Create, useForm, useSelect } from "@refinedev/antd";
import { Alert, Form, Input, Select } from "antd";
import { usePlatformAccess } from "../../contexts/org";

export const EventDomainsCreate = () => {
  const { isPlatformAdmin, loading } = usePlatformAccess();
  const canManage = isPlatformAdmin;

  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "event_domains",
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
        description="Only platform admins can create domains."
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
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Host"
          name="host"
          rules={[
            { required: true, message: "Host is required" },
            {
              pattern:
                /^([a-z0-9-]+\.)+[a-z]{2,}$/i,
              message: "Enter a valid hostname",
            },
          ]}
        >
          <Input placeholder="custom.domain.com" />
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
    </Create>
  );
};


