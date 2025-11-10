import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { IResourceComponentsProps } from "@refinedev/core";
import { Alert, Space, Table } from "antd";
import { useMemo } from "react";
import { usePlatformAccess } from "../../contexts/org";

const EVENT_DOMAINS_META = {
  select: "host, created_at, event_id, event:events(id, slug, org_id)",
} as const;

export const EventDomainsList: React.FC<IResourceComponentsProps> = () => {
  const { loading, isPlatformAdmin } = usePlatformAccess();
  const canManage = isPlatformAdmin;

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

  return (
    <List
      title="Event Domains"
      createButtonProps={{
        disabled: !canManage,
        title: canManage
          ? undefined
          : "Only platform admins can create custom domains",
      }}
    >
      {!canManage && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Restricted resource"
          description="Only platform admins can manage event domains."
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
                disabled={!canManage}
              />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};


