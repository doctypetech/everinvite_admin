import { Create, useForm, useSelect } from "@refinedev/antd";
import { Alert, Form, Input, Select } from "antd";
import { useOrg } from "../../contexts/org";

export const TemplatesCreate = () => {
  const { isPlatformAdmin } = useOrg();

  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "templates",
    redirect: "list",
  });

  const { selectProps: eventTypeSelectProps } = useSelect({
    resource: "event_types",
    optionLabel: "name",
    optionValue: "id",
  });

  const handleFinish = async (values: any) => {
    if (!isPlatformAdmin) {
      return false;
    }

    return onFinish?.({
      ...values,
      supported_variants: values.supported_variants ?? [],
    });
  };

  if (!isPlatformAdmin) {
    return (
      <Alert
        type="warning"
        message="Insufficient permissions"
        description="Only platform admins can create templates."
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
          supported_variants: [],
        }}
      >
        <Form.Item
          label="Event Type"
          name="event_type_id"
          rules={[{ required: true, message: "Event type is required" }]}
        >
          <Select
            placeholder="Select event type"
            {...eventTypeSelectProps}
          />
        </Form.Item>

        <Form.Item
          label="Key"
          name="key"
          rules={[
            { required: true, message: "Key is required" },
            {
              pattern: /^[a-z0-9-_]+$/,
              message: "Use lowercase letters, numbers, dashes, or underscores",
            },
          ]}
        >
          <Input placeholder="wedding_minimal" />
        </Form.Item>

        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input placeholder="Wedding Minimal" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={4} placeholder="Template description" />
        </Form.Item>

        <Form.Item
          label="Component Key"
          name="component_key"
          rules={[{ required: true, message: "Component key is required" }]}
        >
          <Input placeholder="wedding_minimal" />
        </Form.Item>

        <Form.Item label="Supported Variants" name="supported_variants">
          <Select
            mode="tags"
            tokenSeparators={[","]}
            placeholder="Add variants (press enter to add)"
          />
        </Form.Item>

        <Form.Item label="Preview Thumbnail URL" name="preview_thumb_url">
          <Input placeholder="https://..." />
        </Form.Item>
      </Form>
    </Create>
  );
};


