import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { IResourceComponentsProps } from "@refinedev/core";
import { Alert, Space, Table, Tag } from "antd";
import { useMemo } from "react";
import { usePlatformAccess } from "../../contexts/org";

const STATUS_COLOR: Record<string, string> = {
  visible: "green",
  hidden: "gold",
  deleted: "red",
};

const PHOTOS_META = {
  select: "id, event_id, file_url, status, created_at, event:events(id, slug)",
} as const;

export const PhotosList: React.FC<IResourceComponentsProps> = () => {
  const { loading, isPlatformAdmin } = usePlatformAccess();
  const canManage = isPlatformAdmin;

  const tableConfig = useMemo(
    () => ({
      resource: "photos",
      meta: PHOTOS_META,
      queryOptions: {
        enabled: !loading,
      },
    }),
    [loading]
  );

  const { tableProps } = useTable(tableConfig);

  if (loading) {
    return null;
  }

  return (
    <List
      title="Guest Photos"
      createButtonProps={{
        disabled: !canManage,
        title: canManage
          ? undefined
          : "Only platform admins can upload photos",
      }}
    >
      {!canManage && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Restricted resource"
          description="Only platform admins can manage guest photos."
        />
      )}
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex={["event", "slug"]}
          title="Event"
          render={(value: string) => value || "-"}
        />
        <Table.Column dataIndex="file_url" title="File" />
        <Table.Column
          dataIndex="status"
          title="Status"
          render={(value: string) => (
            <Tag color={STATUS_COLOR[value] ?? "default"}>{value}</Tag>
          )}
        />
        <Table.Column dataIndex="created_at" title="Uploaded" />
        <Table.Column
          title="Actions"
          render={(_, record: { id: number }) => (
            <Space>
              <EditButton
                hideText
                size="small"
                recordItemId={record.id}
                disabled={!canManage}
              />
              <DeleteButton
                hideText
                size="small"
                recordItemId={record.id}
                disabled={!canManage}
              />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};


