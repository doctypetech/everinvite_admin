import { Edit, useForm } from "@refinedev/antd";
import { useParsed } from "@refinedev/core";
import { Result } from "antd";
import {
  RESOURCE_DEFINITION_MAP,
  type ResourceDefinition,
} from "../../config/resourceDefinitions";
import { ResourceForm } from "./ResourceForm";

const getResourceDefinition = (name?: string): ResourceDefinition | undefined =>
  name ? RESOURCE_DEFINITION_MAP[name] : undefined;

export const GenericEdit: React.FC = () => {
  const { resource } = useParsed();
  const resourceName =
    typeof resource === "string" ? resource : resource?.name;
  const definition = getResourceDefinition(resourceName);

  const { formProps, saveButtonProps, formLoading } = useForm({
    meta: definition?.form?.meta,
  });

  if (!definition) {
    return (
      <Result
        status="404"
        title="Resource not configured"
        subTitle="The current resource is missing configuration. Please update resourceDefinitions.ts."
      />
    );
  }

  return (
    <Edit
      title={`Edit ${definition.label}`}
      saveButtonProps={saveButtonProps}
      isLoading={formLoading}
    >
      <ResourceForm fields={definition.form.fields} mode="edit" formProps={formProps} />
    </Edit>
  );
};


