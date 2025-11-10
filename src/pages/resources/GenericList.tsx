import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { useParsed } from "@refinedev/core";
import { Alert, Result, Space, Table } from "antd";
import { useMemo } from "react";
import {
  RESOURCE_DEFINITION_MAP,
  type ResourceDefinition,
} from "../../config/resourceDefinitions";
import { useOrg } from "../../contexts/org";
import { formatCellValue, resolveOrgFilterField } from "./helpers";

const getResourceDefinition = (name?: string): ResourceDefinition | undefined =>
  name ? RESOURCE_DEFINITION_MAP[name] : undefined;

export const GenericList: React.FC = () => {
  const { resource } = useParsed();
  const resourceName =
    typeof resource === "string" ? resource : resource?.name;
  const definition = getResourceDefinition(resourceName);
  const { activeMembership } = useOrg();
  const activeOrgId = activeMembership?.orgId ?? null;
  const orgFilterField = resolveOrgFilterField(definition);

  const getRecordId = useMemo(
    () =>
      definition?.getRecordId ??
      ((record: Record<string, any>) => String(record.id)),
    [definition?.getRecordId]
  );

  const { tableProps } = useTable({
    resource: resourceName,
    meta: definition?.list?.meta,
    sorters: {
      initial: definition?.list?.initialSorters,
    },
    filters: {
      initial: definition?.list?.initialFilters,
      permanent:
        orgFilterField && activeOrgId
          ? [
              {
                field: orgFilterField,
                operator: "eq",
                value: activeOrgId,
              },
            ]
          : undefined,
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

  if (!definition.list) {
    return (
      <Alert
        type="warning"
        message="List view unavailable"
        description="This resource does not define a list configuration."
      />
    );
  }

  return (
    <List title={definition.label} resource={definition.name}>
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
            return (
              <Space>
                <EditButton
                  size="small"
                  hideText
                  resource={definition.name}
                  recordItemId={recordId}
                />
                {definition.canDelete !== false && (
                  <DeleteButton
                    size="small"
                    hideText
                    resource={definition.name}
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


