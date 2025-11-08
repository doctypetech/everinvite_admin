import { List, useTable, EditButton } from "@refinedev/antd";
import { IResourceComponentsProps } from "@refinedev/core";
import { Alert, Table, Tag } from "antd";
import { useMemo } from "react";
import { useOrg } from "../../contexts/org";

const STATUS_COLOR: Record<string, string> = {
  visible: "green",
  hidden: "gold",
  deleted: "red",
};

const PHOTOS_META = {
  select: "id, event_id, file_url, status, created_at, event:events(id, slug)",
} as const;

export const PhotosList: React.FC<IResourceComponentsProps> = () => {
  const { activeMembership, loading } = useOrg();
  const orgId = activeMembership?.orgId;
  const canManage = useMemo(
    () => ["owner", "admin", "editor"].includes(activeMembership?.role ?? ""),
    [activeMembership?.role]
  );

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

  const showOrgWarning = !orgId;

  return (
    <List
      title="Guest Photos"
      createButtonProps={{
        disabled: !canManage,
        title: canManage
          ? undefined
          : "Only owner/admin/editor roles can upload photos",
      }}
    >
      {showOrgWarning && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="No organization selected"
          description="Select an organization to manage private photos."
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
            <EditButton
              hideText
              size="small"
              recordItemId={record.id}
              disabled={!canManage}
            />
          )}
        />
      </Table>
    </List>
  );
};


