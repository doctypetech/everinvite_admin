import { useMemo } from "react";
import { Edit, useForm } from "@refinedev/antd";
import { useParsed } from "@refinedev/core";
import { Button, Result, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  RESOURCE_DEFINITION_MAP,
  type ResourceDefinition,
} from "../../config/resourceDefinitions";
import { ResourceForm } from "./ResourceForm";
import { useNavigate, useLocation } from "react-router";
import { RESOURCE_GROUP_ROUTE_BY_RESOURCE } from "../../config/resourceGroups";
import {
  ORGANIZATION_RELATED_RESOURCE_NAMES,
  resolveOrgFilterField,
  getTranslationConfigForResource,
  TRIVIA_RESOURCE_NAMES,
} from "./helpers";

const getResourceDefinition = (name?: string): ResourceDefinition | undefined =>
  name ? RESOURCE_DEFINITION_MAP[name] : undefined;

export const GenericEdit: React.FC = () => {
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
  const organizationField = definition
    ? resolveOrgFilterField(definition)
    : undefined;
  const hasOrganizationField =
    !!organizationField &&
    !!definition?.form.fields.some((field) => field.key === organizationField);

  const { formProps, saveButtonProps, formLoading } = useForm({
    resource: resourceName,
    meta: definition?.form?.meta,
    redirect: false,
    onMutationSuccess: () => {
      const target =
        groupRoute ?? definition?.routes.list ?? "/admin";
      
      // Preserve tab and other URL parameters when navigating back
      const searchParams = new URLSearchParams(location.search);
      const locationState = location.state as Record<string, any> | undefined;
      const stateQuery = locationState?.meta?.query as Record<string, any> | undefined;
      
      // Get tab parameter from URL or state
      const tabParam = searchParams.get("tab") || stateQuery?.tab;
      const viewParam = searchParams.get("view") || stateQuery?.view;
      const orgIdParam = searchParams.get("organizationId") || stateQuery?.organizationId;
      const filterField = searchParams.get("filters[0][field]") || stateQuery?.["filters[0][field]"];
      const filterOperator = searchParams.get("filters[0][operator]") || stateQuery?.["filters[0][operator]"];
      const filterValue = searchParams.get("filters[0][value]") || stateQuery?.["filters[0][value]"];
      
      // Build search params for navigation
      const backParams = new URLSearchParams();
      
      // If we're navigating to a group route and no tab is set, preserve the current resource as the tab
      // This ensures we stay on the same tab when coming from a group page
      const finalTabParam = tabParam || (groupRoute && resourceName ? resourceName : undefined);
      
      if (finalTabParam) {
        backParams.set("tab", finalTabParam);
      }
      
      // Handle view parameter for trivia resources
      // If the resource is a trivia resource and we're going to a group route, set view=trivia
      // Otherwise, preserve the existing view parameter if it exists
      if (resourceName && TRIVIA_RESOURCE_NAMES.has(resourceName) && groupRoute) {
        backParams.set("view", "trivia");
      } else if (viewParam) {
        backParams.set("view", viewParam);
      }
      
      if (orgIdParam) {
        backParams.set("organizationId", orgIdParam);
      }
      
      if (filterField && filterOperator && filterValue) {
        backParams.set("filters[0][field]", filterField);
        backParams.set("filters[0][operator]", filterOperator);
        backParams.set("filters[0][value]", filterValue);
      }
      
      const searchString = backParams.toString();
      navigate({
        pathname: target,
        search: searchString ? `?${searchString}` : "",
      }, { replace: true });
    },
  });

  const initialValues =
    formProps.initialValues as Record<string, unknown> | undefined;
  const translationConfig = definition
    ? getTranslationConfigForResource(definition.name)
    : undefined;
  const translationForeignKey = translationConfig?.foreignKey;
  const lockedFields = useMemo(() => {
    const fields: Record<string, unknown> = {};

    if (
      hasOrganizationField &&
      organizationField &&
      initialValues &&
      initialValues[organizationField] !== undefined
    ) {
      fields[organizationField] = initialValues[organizationField];
    }

    if (
      translationForeignKey &&
      initialValues &&
      initialValues[translationForeignKey] !== undefined
    ) {
      fields[translationForeignKey] = initialValues[translationForeignKey];
    }

    return Object.keys(fields).length > 0 ? fields : undefined;
  }, [
    hasOrganizationField,
    organizationField,
    initialValues,
    translationForeignKey,
  ]);

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
        mode="edit"
        formProps={formProps}
        lockedFields={lockedFields}
      />
    </Edit>
  );
};


