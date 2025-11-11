import { Create, useForm } from "@refinedev/antd";
import { useParsed } from "@refinedev/core";
import { Button, Result, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  RESOURCE_DEFINITION_MAP,
  type ResourceDefinition,
} from "../../config/resourceDefinitions";
import { ResourceForm } from "./ResourceForm";
import { useLocation, useNavigate } from "react-router";
import { RESOURCE_GROUP_ROUTE_BY_RESOURCE } from "../../config/resourceGroups";
import {
  ORGANIZATION_RELATED_RESOURCE_NAMES,
  resolveOrgFilterField,
} from "./helpers";

const getResourceDefinition = (name?: string): ResourceDefinition | undefined =>
  name ? RESOURCE_DEFINITION_MAP[name] : undefined;

export const GenericCreate: React.FC = () => {
  const { resource } = useParsed();
  const resourceName =
    typeof resource === "string" ? resource : resource?.name;
  const definition = getResourceDefinition(resourceName);
  const navigate = useNavigate();
  const location = useLocation();
  const groupRoute =
    resourceName && RESOURCE_GROUP_ROUTE_BY_RESOURCE[resourceName];
  const isOrganizationRelatedResource = definition
    ? ORGANIZATION_RELATED_RESOURCE_NAMES.has(definition.name)
    : false;
  const searchParams = new URLSearchParams(location.search);
  const organizationIdParam =
    searchParams.get("organizationId") ?? searchParams.get("filters[0][value]");
  const organizationField = definition
    ? resolveOrgFilterField(definition)
    : undefined;
  const hasOrganizationField =
    !!organizationField &&
    !!definition?.form.fields.some((field) => field.key === organizationField);
  const allowOrganizationPrefill =
    hasOrganizationField &&
    (organizationField === "organization_id" ||
      organizationField.endsWith(".organization_id"));
  const lockedFields =
    organizationIdParam && allowOrganizationPrefill && organizationField
      ? { [organizationField]: organizationIdParam }
      : undefined;

  const { formProps, saveButtonProps } = useForm({
    resource: resourceName,
    meta: definition?.form?.meta,
    redirect: false,
    defaultValues:
      lockedFields ?? undefined,
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
      headerButtons={({ defaultButtons }) => (
        <Space wrap>
          {isOrganizationRelatedResource && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/admin/organization")}
            >
              Back to Organizations
            </Button>
          )}
          {defaultButtons}
        </Space>
      )}
    >
      <ResourceForm
        fields={definition.form.fields}
        mode="create"
        formProps={formProps}
        lockedFields={lockedFields}
      />
    </Create>
  );
};


