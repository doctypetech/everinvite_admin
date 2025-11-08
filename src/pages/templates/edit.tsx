import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Alert, Form, Input, Select } from "antd";
import { useOrg } from "../../contexts/org";

export const TemplatesEdit = () => {
  const { isPlatformAdmin } = useOrg();

  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "templates",
    redirect: "list",
    meta: {
      select:
        "id, event_type_id, key, name, description, component_key, supported_variants, preview_thumb_url",
    },
  });

  const { selectProps: eventTypeSelectProps } = useSelect({
    resource: "event_types",
    optionLabel: "name",
    optionValue: "id",
  });

  const initialValues = {
    ...formProps.initialValues,
    supported_variants:
      formProps.initialValues?.supported_variants ?? [],
  };

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
        description="Only platform admins can edit templates."
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
        initialValues={initialValues}
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

        <Form.Item label="Key" name="key">
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label="Component Key"
          name="component_key"
          rules={[{ required: true, message: "Component key is required" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Supported Variants" name="supported_variants">
          <Select mode="tags" tokenSeparators={[","]} />
        </Form.Item>

        <Form.Item label="Preview Thumbnail URL" name="preview_thumb_url">
          <Input />
        </Form.Item>
      </Form>
    </Edit>
  );
};

