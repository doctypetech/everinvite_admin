import { Create, useForm, useSelect } from "@refinedev/antd";
import { Alert, Form, Input, message, Select } from "antd";
import { usePlatformAccess } from "../../contexts/org";

export const ThemesCreate = () => {
  const { isPlatformAdmin } = usePlatformAccess();

  const { formProps, saveButtonProps, onFinish } = useForm({
    resource: "themes",
    redirect: "list",
  });

  const { selectProps: templateSelectProps } = useSelect({
    resource: "templates",
    optionLabel: "name",
    optionValue: "id",
  });

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
        description="Only platform admins can create themes."
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
          palette_json: JSON.stringify(
            {
              primary: "#000000",
              accent: "#FFFFFF",
              bg: "#FFFFFF",
              text: "#000000",
            },
            null,
            2
          ),
          fonts_json: JSON.stringify(
            {
              heading: "Cormorant",
              body: "Inter",
            },
            null,
            2
          ),
        }}
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
          <Input placeholder="Blush & Gold" />
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
    </Create>
  );
};


