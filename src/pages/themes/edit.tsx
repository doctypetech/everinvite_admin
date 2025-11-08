import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Alert, Form, Input, message, Select } from "antd";
import { useOrg } from "../../contexts/org";

export const ThemesEdit = () => {
  const { isPlatformAdmin } = useOrg();

  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "themes",
    redirect: "list",
    meta: {
      select:
        "id, template_id, name, palette, fonts, preview_thumb_url",
    },
  });

  const { selectProps: templateSelectProps } = useSelect({
    resource: "templates",
    optionLabel: "name",
    optionValue: "id",
  });

  const initialValues = {
    ...formProps.initialValues,
    palette_json: formProps.initialValues?.palette
      ? JSON.stringify(formProps.initialValues.palette, null, 2)
      : undefined,
    fonts_json: formProps.initialValues?.fonts
      ? JSON.stringify(formProps.initialValues.fonts, null, 2)
      : undefined,
  };

  const handleFinish = async (values: any) => {
    if (!isPlatformAdmin) {
      return false;
    }

    try {
      const palette = JSON.parse(values.palette_json);
      const fonts = JSON.parse(values.fonts_json);

      return onFinish?.({
        template_id: values.template_id,
        name: values.name,
        palette,
        fonts,
        preview_thumb_url: values.preview_thumb_url,
      });
    } catch (error) {
      console.error(error);
      message.error("Palette and fonts must be valid JSON objects.");
      return false;
    }
  };

  if (!isPlatformAdmin) {
    return (
      <Alert
        type="warning"
        message="Insufficient permissions"
        description="Only platform admins can edit themes."
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
          label="Template"
          name="template_id"
          rules={[{ required: true, message: "Template is required" }]}
        >
          <Select
            placeholder="Select template"
            {...templateSelectProps}
          />
        </Form.Item>

        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input placeholder="Theme name" />
        </Form.Item>

        <Form.Item
          label="Palette JSON"
          name="palette_json"
          rules={[{ required: true, message: "Palette JSON is required" }]}
        >
          <Input.TextArea rows={6} />
        </Form.Item>

        <Form.Item
          label="Fonts JSON"
          name="fonts_json"
          rules={[{ required: true, message: "Fonts JSON is required" }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item label="Preview Thumbnail URL" name="preview_thumb_url">
          <Input placeholder="https://..." />
        </Form.Item>
      </Form>
    </Edit>
  );
};


