import { Create, useForm, useSelect } from "@refinedev/antd";
import { Alert, Form, Input, Select } from "antd";
import { useMemo } from "react";
import { useOrg } from "../../contexts/org";

export const EventDomainsCreate = () => {
  const { activeMembership } = useOrg();
  const orgId = activeMembership?.orgId;
  const canManage = useMemo(
    () => ["owner", "admin", "editor"].includes(activeMembership?.role ?? ""),
    [activeMembership?.role]
  );

  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "event_domains",
    redirect: "list",
  });

  const { selectProps: eventSelectProps } = useSelect({
    resource: "events",
    optionLabel: "slug",
    optionValue: "id",
    filters: orgId
      ? [
          {
            field: "org_id",
            operator: "eq",
            value: orgId,
          },
        ]
      : [],
    queryOptions: {
      enabled: Boolean(orgId),
    },
  });

  const handleFinish = async (values: any) => {
    if (!canManage) {
      return false;
    }

    return onFinish?.(values);
  };

  if (!orgId) {
    return (
      <Alert
        type="info"
        message="No organization selected"
        description="Select an organization to manage custom domains."
      />
    );
  }

  if (!canManage) {
    return (
      <Alert
        type="warning"
        message="Insufficient permissions"
        description="You need owner, admin, or editor access to create domains."
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


