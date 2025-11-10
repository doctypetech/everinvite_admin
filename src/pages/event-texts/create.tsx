import { Create, useForm, useSelect } from "@refinedev/antd";
import { Alert, Form, Input, Select } from "antd";
import { usePlatformAccess } from "../../contexts/org";

export const EventTextsCreate = () => {
  const { isPlatformAdmin, loading } = usePlatformAccess();
  const canManage = isPlatformAdmin;

  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "event_texts",
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
        description="Only platform admins can create event copy."
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
      <Form
        {...formProps}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          locale: "en",
        }}
      >
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

        <Form.Item
          label="Locale"
          name="locale"
          rules={[{ required: true, message: "Locale is required" }]}
        >
          <Select
            options={[
              { label: "English (en)", value: "en" },
              { label: "Arabic (ar)", value: "ar" },
              { label: "French (fr)", value: "fr" },
            ]}
            showSearch
          />
        </Form.Item>

        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="Event title" />
        </Form.Item>

        <Form.Item label="Body Copy" name="body_copy">
          <Input.TextArea rows={6} placeholder="Event description" />
        </Form.Item>
      </Form>
    </Create>
  );
};


