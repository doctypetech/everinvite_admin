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
import { useNavigate } from "react-router";
import { RESOURCE_GROUP_ROUTE_BY_RESOURCE } from "../../config/resourceGroups";
import {
  ORGANIZATION_RELATED_RESOURCE_NAMES,
  resolveOrgFilterField,
  getTranslationConfigForResource,
} from "./helpers";

const getResourceDefinition = (name?: string): ResourceDefinition | undefined =>
  name ? RESOURCE_DEFINITION_MAP[name] : undefined;

export const GenericEdit: React.FC = () => {
  const { resource } = useParsed();
  const resourceName =
    typeof resource === "string" ? resource : resource?.name;
  const definition = getResourceDefinition(resourceName);
  const navigate = useNavigate();
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
      navigate(target, { replace: true });
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


