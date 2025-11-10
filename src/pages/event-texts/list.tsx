import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { IResourceComponentsProps } from "@refinedev/core";
import { Alert, Space, Table } from "antd";
import { useMemo } from "react";
import { usePlatformAccess } from "../../contexts/org";

const EVENT_TEXTS_META = {
  select:
    "event_id, locale, title, updated_at, event:events(id, slug, org_id)",
} as const;

export const EventTextsList: React.FC<IResourceComponentsProps> = () => {
  const { loading, isPlatformAdmin } = usePlatformAccess();
  const canManage = isPlatformAdmin;

  const tableConfig = useMemo(
    () => ({
      resource: "event_texts",
      meta: EVENT_TEXTS_META,
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
      title="Event Texts"
      createButtonProps={{
        disabled: !canManage,
        title: canManage
          ? undefined
          : "Only platform admins can create event copy",
      }}
    >
      {!canManage && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Restricted resource"
          description="Only platform admins can manage event texts."
        />
      )}
      <Table
        {...tableProps}
        rowKey={(row: any) => `${row.event_id}-${row.locale}`}
      >
        <Table.Column
          dataIndex={["event", "slug"]}
          title="Event"
          render={(value: string) => value || "-"}
        />
        <Table.Column dataIndex="locale" title="Locale" />
        <Table.Column dataIndex="title" title="Title" />
        <Table.Column dataIndex="updated_at" title="Updated" />
        <Table.Column
          title="Actions"
          render={(_, record: any) => (
            <Space>
              <EditButton
                size="small"
                disabled={!canManage}
                hideText
                recordItemId={`${record.event_id}-${record.locale}`}
                meta={{
                  event_id: record.event_id,
                  locale: record.locale,
                }}
              />
              <DeleteButton
                size="small"
                hideText
                recordItemId={`${record.event_id}-${record.locale}`}
                meta={{
                  event_id: record.event_id,
                  locale: record.locale,
                }}
                disabled={!canManage}
              />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};


