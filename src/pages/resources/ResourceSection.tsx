import {
  CreateButton,
  DeleteButton,
  EditButton,
  List,
  useTable,
} from "@refinedev/antd";
import {
  Alert,
  Button,
  Result,
  Space,
  Table,
  Tooltip,
} from "antd";
import {
  FileTextOutlined,
  UsergroupAddOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router";

import {
  RESOURCE_DEFINITION_MAP,
  type ResourceDefinition,
} from "../../config/resourceDefinitions";
import {
  formatCellValue,
  ORGANIZATION_RELATED_RESOURCES,
  buildOrganizationResourceListUrl,
  buildOrganizationGroupUrl,
  resolveResourceGroupForResource,
  resolveOrgFilterField,
} from "./helpers";
import type { CrudFilters } from "@refinedev/core";

const getResourceDefinition = (
  name?: string,
): ResourceDefinition | undefined =>
  name ? RESOURCE_DEFINITION_MAP[name] : undefined;

const ORGANIZATION_ACTION_ICON_MAP: Record<string, ReactNode> = {
  invitees: <UsergroupAddOutlined />,
  organization_content: <FileTextOutlined />,
  trivia_questions: <BulbOutlined />,
};

export type ResourceSectionProps = {
  resourceName: string;
  title?: string;
  organizationId?: string;
};

export const ResourceSection: React.FC<ResourceSectionProps> = ({
  resourceName,
  title,
  organizationId,
}) => {
  const definition = getResourceDefinition(resourceName);
  const navigate = useNavigate();

  const getRecordId = useMemo(
    () =>
      definition?.getRecordId ??
      ((record: Record<string, any>) => String(record.id)),
    [definition?.getRecordId],
  );

  const organizationFilterField =
    organizationId && definition
      ? resolveOrgFilterField(definition)
      : undefined;

  const baseInitialFilters = useMemo<CrudFilters>(
    () => [...(definition?.list?.initialFilters ?? [])],
    [definition?.list?.initialFilters],
  );

  const organizationFilters = useMemo<CrudFilters | undefined>(() => {
    if (!organizationFilterField) {
      return undefined;
    }
    return [
      {
        field: organizationFilterField,
        operator: "eq",
        value: organizationId,
      },
    ];
  }, [organizationFilterField, organizationId]);

  const filtersConfig = useMemo(() => {
    if (
      baseInitialFilters.length === 0 &&
      (organizationFilters?.length ?? 0) === 0
    ) {
      return undefined;
    }

    const initialFilters = organizationFilters
      ? [...baseInitialFilters, ...organizationFilters]
      : [...baseInitialFilters];

    return {
      initial: initialFilters,
      ...(organizationFilters ? { permanent: organizationFilters } : {}),
    };
  }, [baseInitialFilters, organizationFilters]);

  const { tableProps, tableQuery } = useTable({
    resource: resourceName,
    meta: definition?.list?.meta,
    sorters: {
      initial: definition?.list?.initialSorters,
    },
    filters: filtersConfig,
    syncWithLocation: false,
  });

  if (!definition) {
    return (
      <Result
        status="404"
        title="Resource not configured"
        subTitle={`Missing configuration for resource "${resourceName}".`}
      />
    );
  }

  if (!definition.list) {
    return (
      <Alert
        type="warning"
        message="List view unavailable"
        description="This resource does not define a list configuration."
      />
    );
  }

  if (tableQuery?.isError) {
    return (
      <Result
        status="error"
        title="Failed to load data"
        subTitle={
          tableQuery?.error?.message ??
          "An unexpected error occurred while loading this resource."
        }
        extra={
          <Button type="primary" onClick={() => tableQuery.refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <List
      title={title ?? definition.label}
      resource={resourceName}
      breadcrumb={false}
      headerButtons={({ createButtonProps, defaultButtons }) => {
        if (!createButtonProps) {
          return defaultButtons ?? null;
        }

        const button = organizationId ? (
          <CreateButton
            {...createButtonProps}
            meta={{
              ...(createButtonProps.meta ?? {}),
              query: {
                ...(createButtonProps.meta?.query ?? {}),
                organizationId,
              },
            }}
          />
        ) : (
          <CreateButton {...createButtonProps} />
        );

        return button;
      }}
    >
      <Table
        {...tableProps}
        rowKey={(record) => getRecordId(record as Record<string, any>)}
        scroll={{ x: true }}
      >
        {definition.list.columns.map((column) => (
          <Table.Column
            key={column.key}
            dataIndex={column.key}
            title={column.title}
            width={column.width}
            render={(value, record: Record<string, unknown>) =>
              column.render
                ? column.render(value, record)
                : formatCellValue(value, column.type)
            }
          />
        ))}
        <Table.Column<Record<string, any>>
          fixed="right"
          title="Actions"
          render={(_, record) => {
            const recordId = getRecordId(record);
            const organizationId =
              (record as Record<string, any>).id ?? recordId;
            return (
              <Space>
                {resourceName === "organizations" &&
                  ORGANIZATION_RELATED_RESOURCES.map(({ resource, label }) => {
                    const groupForResource =
                      resolveResourceGroupForResource(resource);
                    const to =
                      groupForResource === "organization"
                        ? buildOrganizationGroupUrl(
                            groupForResource,
                            organizationId,
                            resource,
                          )
                        : buildOrganizationResourceListUrl(
                            resource,
                            organizationId,
                          );
                    const icon = ORGANIZATION_ACTION_ICON_MAP[resource];

                    if (!to || !icon) {
                      return null;
                    }

                    return (
                      <Tooltip title={label} key={resource}>
                        <Button
                          size="small"
                          icon={icon}
                          aria-label={label}
                          onClick={() => navigate(to)}
                        />
                      </Tooltip>
                    );
                  })}
                <EditButton
                  size="small"
                  hideText
                  resource={resourceName}
                  recordItemId={recordId}
                />
                {definition.canDelete !== false && (
                  <DeleteButton
                    size="small"
                    hideText
                    resource={resourceName}
                    recordItemId={recordId}
                  />
                )}
              </Space>
            );
          }}
        />
      </Table>
    </List>
  );
};

