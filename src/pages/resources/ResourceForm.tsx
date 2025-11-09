import { useMemo, useEffect, useCallback } from "react";
import { App, Form } from "antd";
import type { FormProps } from "antd";
import type { FieldDefinition } from "../../config/resourceDefinitions";
import { ResourceField } from "./ResourceField";
import { convertInitialValues, serializeFormValues } from "./helpers";

type Mode = "create" | "edit";

type ResourceFormProps = {
  fields: FieldDefinition[];
  mode: Mode;
  formProps: FormProps;
};

export const ResourceForm: React.FC<ResourceFormProps> = ({
  fields,
  mode,
  formProps,
}) => {
  const { notification } = App.useApp();

  const defaults = useMemo(() => {
    const initial: Record<string, unknown> = {};
    fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        initial[field.key] = field.defaultValue;
      }
    });
    return initial;
  }, [fields]);

  const { form, onFinish, initialValues: rawInitialValues, ...restFormProps } =
    formProps;

  const mergedInitialValues = useMemo(() => {
    const initial = {
      ...defaults,
      ...(rawInitialValues as Record<string, unknown> | undefined),
    };
    return convertInitialValues(initial, fields);
  }, [defaults, fields, rawInitialValues]);

  useEffect(() => {
    if (form && mergedInitialValues) {
      form.setFieldsValue(mergedInitialValues);
    }
  }, [form, mergedInitialValues]);

  const handleFinish = useCallback(
    async (values: Record<string, unknown>) => {
      try {
        const prepared = serializeFormValues(values, fields);
        await onFinish?.(prepared);
      } catch (error) {
        notification.error({
          message: "Invalid form data",
          description: (error as Error).message,
        });
      }
    },
    [fields, notification, onFinish]
  );

  return (
    <Form
      {...restFormProps}
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={mergedInitialValues}
    >
      {fields.map((field) => (
        <ResourceField key={field.key} field={field} mode={mode} />
      ))}
    </Form>
  );
};


