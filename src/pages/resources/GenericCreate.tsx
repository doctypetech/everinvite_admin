import { Create, useForm } from "@refinedev/antd";
import { useParsed } from "@refinedev/core";
import { Result } from "antd";
import {
  RESOURCE_DEFINITION_MAP,
  type ResourceDefinition,
} from "../../config/resourceDefinitions";
import { ResourceForm } from "./ResourceForm";
import { useNavigate } from "react-router";
import { RESOURCE_GROUP_ROUTE_BY_RESOURCE } from "../../config/resourceGroups";

const getResourceDefinition = (name?: string): ResourceDefinition | undefined =>
  name ? RESOURCE_DEFINITION_MAP[name] : undefined;

export const GenericCreate: React.FC = () => {
  const { resource } = useParsed();
  const resourceName =
    typeof resource === "string" ? resource : resource?.name;
  const definition = getResourceDefinition(resourceName);
  const navigate = useNavigate();
  const groupRoute =
    resourceName && RESOURCE_GROUP_ROUTE_BY_RESOURCE[resourceName];

  const { formProps, saveButtonProps } = useForm({
    resource: resourceName,
    meta: definition?.form?.meta,
    redirect: false,
    onMutationSuccess: () => {
      const target =
        groupRoute ?? definition?.routes.list ?? "/admin";
      navigate(target, { replace: true });
    },
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
    <Create
      title={`Create ${definition.label}`}
      saveButtonProps={saveButtonProps}
      resource={definition.name}
    >
      <ResourceForm fields={definition.form.fields} mode="create" formProps={formProps} />
    </Create>
  );
};


