import { DeleteButton, EditButton, List, useTable } from "@refinedev/antd";
import { Alert, Result, Space, Table } from "antd";
import { useMemo } from "react";

import {
  RESOURCE_DEFINITION_MAP,
  type ResourceDefinition,
} from "../../config/resourceDefinitions";
import { formatCellValue } from "./helpers";

const getResourceDefinition = (
  name?: string,
): ResourceDefinition | undefined =>
  name ? RESOURCE_DEFINITION_MAP[name] : undefined;

export type ResourceSectionProps = {
  resourceName: string;
  title?: string;
};

export const ResourceSection: React.FC<ResourceSectionProps> = ({
  resourceName,
  title,
}) => {
  const definition = getResourceDefinition(resourceName);

  const getRecordId = useMemo(
    () =>
      definition?.getRecordId ??
      ((record: Record<string, any>) => String(record.id)),
    [definition?.getRecordId],
  );

  const { tableProps } = useTable({
    resource: resourceName,
    meta: definition?.list?.meta,
    sorters: {
      initial: definition?.list?.initialSorters,
    },
    filters: {
      initial: definition?.list?.initialFilters,
    },
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

  return (
    <List
      title={title ?? definition.label}
      resource={resourceName}
      breadcrumb={false}
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
            return (
              <Space>
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

