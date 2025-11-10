import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Alert, Form, Input, Select } from "antd";
import { useParams } from "react-router";
import { usePlatformAccess } from "../../contexts/org";

export const EventTextsEdit = () => {
  const { isPlatformAdmin, loading } = usePlatformAccess();
  const canManage = isPlatformAdmin;

  const { id } = useParams<{ id: string }>();

  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "event_texts",
    redirect: "list",
    id,
    meta: {
      select: "event_id, locale, title, body_copy",
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

  if (!id) {
    return (
      <Alert
        type="error"
        message="Invalid record"
        description="Missing event text identifier."
      />
    );
  }

  if (!canManage) {
    return (
      <Alert
        type="warning"
        message="Insufficient permissions"
        description="Only platform admins can edit event copy."
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
        <Form.Item
          label="Event"
          name="event_id"
          rules={[{ required: true, message: "Event is required" }]}
        >
          <Select
            placeholder="Select event"
            {...eventSelectProps}
            disabled
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
            disabled
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
    </Edit>
  );
};


