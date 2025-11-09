import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { IResourceComponentsProps } from "@refinedev/core";
import { Alert, Space, Table } from "antd";
import { useMemo } from "react";
import { useOrg } from "../../contexts/org";

const EVENT_DOMAINS_META = {
  select: "host, created_at, event_id, event:events(id, slug, org_id)",
} as const;

export const EventDomainsList: React.FC<IResourceComponentsProps> = () => {
  const { activeMembership, loading, isPlatformAdmin } = useOrg();
  const orgId = activeMembership?.orgId;
  const canManage = useMemo(
    () => ["owner", "admin", "editor"].includes(activeMembership?.role ?? ""),
    [activeMembership?.role]
  );
  const canDelete = isPlatformAdmin || canManage;

  const tableConfig = useMemo(
    () => ({
      resource: "event_domains",
      meta: EVENT_DOMAINS_META,
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
      title="Event Domains"
      createButtonProps={{
        disabled: !canManage,
        title: canManage
          ? undefined
          : "Only owner/admin/editor roles can create custom domains",
      }}
    >
      {showOrgWarning && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="No organization selected"
          description="Select an organization to manage private domains."
        />
      )}
      <Table {...tableProps} rowKey="host">
        <Table.Column dataIndex="host" title="Host" />
        <Table.Column
          dataIndex={["event", "slug"]}
          title="Event"
          render={(value: string) => value || "-"}
        />
        <Table.Column dataIndex="created_at" title="Created" />
        <Table.Column
          title="Actions"
          render={(_, record: { host: string }) => (
            <Space>
              <EditButton
                hideText
                size="small"
                recordItemId={record.host}
                disabled={!canManage}
              />
              <DeleteButton
                hideText
                size="small"
                recordItemId={record.host}
                disabled={!canDelete}
              />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};


