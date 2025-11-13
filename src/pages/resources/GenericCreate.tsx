import { useMemo } from "react";
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
  getTranslationConfigForResource,
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
  const translationConfig = definition
    ? getTranslationConfigForResource(definition.name)
    : undefined;
  const translationForeignKey = translationConfig?.foreignKey;
  const locationState = location.state as Record<string, any> | undefined;
  const translationPrefillValue = (() => {
    if (!translationForeignKey) {
      return undefined;
    }

    const directParam = searchParams.get(translationForeignKey);
    if (directParam) {
      return directParam;
    }

    if (searchParams.get("filters[0][field]") === translationForeignKey) {
      const filterValue = searchParams.get("filters[0][value]");
      if (filterValue) {
        return filterValue;
      }
    }

    const stateQuery = locationState?.meta?.query as Record<string, any> | undefined;
    const fromStateQuery =
      stateQuery?.[translationForeignKey] ??
      stateQuery?.filters?.[0]?.value;
    if (fromStateQuery) {
      return String(fromStateQuery);
    }

    const directStateValue = locationState?.[translationForeignKey];
    if (directStateValue) {
      return String(directStateValue);
    }

    return undefined;
  })();

  const lockedFields = useMemo(() => {
    const fields: Record<string, unknown> = {};

    if (organizationIdParam && allowOrganizationPrefill && organizationField) {
      fields[organizationField] = organizationIdParam;
    }

    if (translationForeignKey && translationPrefillValue) {
      fields[translationForeignKey] = translationPrefillValue;
    }

    return Object.keys(fields).length > 0 ? fields : undefined;
  }, [
    allowOrganizationPrefill,
    organizationField,
    organizationIdParam,
    translationForeignKey,
    translationPrefillValue,
  ]);

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


