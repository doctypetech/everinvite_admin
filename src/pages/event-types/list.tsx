import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { IResourceComponentsProps } from "@refinedev/core";
import { Alert, Space, Table } from "antd";
import { useMemo } from "react";
import { usePlatformAccess } from "../../contexts/org";

const EVENT_TYPES_META = {
  select: "id, key, name, sort_order, created_at",
} as const;

export const EventTypesList: React.FC<IResourceComponentsProps> = () => {
  const { isPlatformAdmin } = usePlatformAccess();

  const tableConfig = useMemo(
    () => ({
      resource: "event_types",
      meta: EVENT_TYPES_META,
    }),
    []
  );

  const { tableProps } = useTable(tableConfig);

  if (tableProps.loading) {
    return null;
  }

  return (
    <List
      title="Event Types"
      createButtonProps={{
        disabled: !isPlatformAdmin,
        title: isPlatformAdmin
          ? undefined
          : "Only platform admins can create event types",
      }}
    >
      {!isPlatformAdmin && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Read-only access"
          description="You can view event types but only platform admins can modify them."
        />
      )}
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="key" title="Key" />
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column dataIndex="sort_order" title="Sort Order" />
        <Table.Column dataIndex="created_at" title="Created" />
        <Table.Column
          title="Actions"
          render={(_, record: { id: number }) => (
            <Space>
              <EditButton
                hideText
                size="small"
                recordItemId={record.id}
                disabled={!isPlatformAdmin}
              />
              <DeleteButton
                hideText
                size="small"
                recordItemId={record.id}
                disabled={!isPlatformAdmin}
              />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};


