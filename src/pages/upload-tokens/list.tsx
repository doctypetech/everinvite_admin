import { List, useTable, EditButton } from "@refinedev/antd";
import { IResourceComponentsProps } from "@refinedev/core";
import { Alert, Table, Tag } from "antd";
import { useMemo } from "react";
import { useOrg } from "../../contexts/org";

const UPLOAD_TOKENS_META = {
  select:
    "id, event_id, token, expires_at, max_uploads, used_count, event:events(id, slug)",
} as const;

export const UploadTokensList: React.FC<IResourceComponentsProps> = () => {
  const { activeMembership, loading } = useOrg();
  const orgId = activeMembership?.orgId;
  const canManage = useMemo(
    () => ["owner", "admin", "editor"].includes(activeMembership?.role ?? ""),
    [activeMembership?.role]
  );

  const tableConfig = useMemo(
    () => ({
      resource: "upload_tokens",
      meta: UPLOAD_TOKENS_META,
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
      title="Upload Tokens"
      createButtonProps={{
        disabled: !canManage,
        title: canManage
          ? undefined
          : "Only owner/admin/editor roles can create upload tokens",
      }}
    >
      {showOrgWarning && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="No organization selected"
          description="Select an organization to manage private upload tokens."
        />
      )}
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex={["event", "slug"]}
          title="Event"
          render={(value: string) => value || "-"}
        />
        <Table.Column dataIndex="token" title="Token" />
        <Table.Column dataIndex="expires_at" title="Expires" />
        <Table.Column dataIndex="max_uploads" title="Max Uploads" />
        <Table.Column dataIndex="used_count" title="Used" />
        <Table.Column
          title="Remaining"
          render={(_, record: any) => {
            const remaining = (record.max_uploads ?? 0) - (record.used_count ?? 0);
            const color = remaining > 0 ? "green" : "red";
            return <Tag color={color}>{remaining}</Tag>;
          }}
        />
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


