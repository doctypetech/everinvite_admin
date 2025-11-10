import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { IResourceComponentsProps } from "@refinedev/core";
import { Alert, Space, Table } from "antd";
import { useMemo } from "react";
import { usePlatformAccess } from "../../contexts/org";

const TEMPLATES_META = {
  select:
    "id, key, name, description, component_key, supported_variants, event_type_id, event_type:event_types(id, name)",
} as const;

export const TemplatesList: React.FC<IResourceComponentsProps> = () => {
  const { isPlatformAdmin } = usePlatformAccess();

  const tableConfig = useMemo(
    () => ({
      resource: "templates",
      meta: TEMPLATES_META,
    }),
    []
  );

  const { tableProps } = useTable(tableConfig);

  if (tableProps.loading) {
    return null;
  }

  return (
    <List
      title="Templates"
      createButtonProps={{
        disabled: !isPlatformAdmin,
        title: isPlatformAdmin
          ? undefined
          : "Only platform admins can create templates",
      }}
    >
      {!isPlatformAdmin && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Read-only access"
          description="You can view templates but only platform admins can modify them."
        />
      )}
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="key" title="Key" />
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column
          dataIndex={["event_type", "name"]}
          title="Event Type"
          render={(value: string) => value || "-"}
        />
        <Table.Column dataIndex="component_key" title="Component" />
        <Table.Column
          dataIndex="supported_variants"
          title="Variants"
          render={(value: string[]) => value?.join(", ") || "-"}
        />
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


