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
  lockedFields?: Record<string, unknown>;
};

export const ResourceForm: React.FC<ResourceFormProps> = ({
  fields,
  mode,
  formProps,
  lockedFields,
}) => {
  const { notification } = App.useApp();

  const defaults = useMemo(() => {
    const initial: Record<string, unknown> = {
      ...(lockedFields ?? {}),
    };
    fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        initial[field.key] = field.defaultValue;
      }
    });
    return initial;
  }, [fields, lockedFields]);

  const { form, onFinish, initialValues: rawInitialValues, ...restFormProps } =
    formProps;

  const mergedInitialValues = useMemo(() => {
    const initial = {
      ...defaults,
      ...(rawInitialValues as Record<string, unknown> | undefined),
      ...(lockedFields ?? {}),
    };
    return convertInitialValues(initial, fields);
  }, [defaults, fields, lockedFields, rawInitialValues]);

  useEffect(() => {
    if (form && mergedInitialValues) {
      form.setFieldsValue(mergedInitialValues);
    }
  }, [form, mergedInitialValues]);

  const handleFinish = useCallback(
    async (values: Record<string, unknown>) => {
      try {
        const prepared = serializeFormValues(
          {
            ...values,
            ...(lockedFields ?? {}),
          },
          fields
        );
        await onFinish?.(prepared);
      } catch (error) {
        notification.error({
          message: "Invalid form data",
          description: (error as Error).message,
        });
      }
    },
    [fields, lockedFields, notification, onFinish]
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
        <ResourceField
          key={field.key}
          field={field}
          mode={mode}
          lockedValue={lockedFields?.[field.key]}
        />
      ))}
    </Form>
  );
};


