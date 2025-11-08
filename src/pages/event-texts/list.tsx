import { List, useTable, EditButton } from "@refinedev/antd";
import { IResourceComponentsProps } from "@refinedev/core";
import { Alert, Table } from "antd";
import { useMemo } from "react";
import { useOrg } from "../../contexts/org";

const EVENT_TEXTS_META = {
  select:
    "event_id, locale, title, updated_at, event:events(id, slug, org_id)",
} as const;

export const EventTextsList: React.FC<IResourceComponentsProps> = () => {
  const { activeMembership, loading } = useOrg();
  const orgId = activeMembership?.orgId;
  const canManage = useMemo(
    () => ["owner", "admin", "editor"].includes(activeMembership?.role ?? ""),
    [activeMembership?.role]
  );

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

  const showOrgWarning = !orgId;

  return (
    <List
      title="Event Texts"
      createButtonProps={{
        disabled: !canManage,
        title: canManage
          ? undefined
          : "Only owner/admin/editor roles can create event copy",
      }}
    >
      {showOrgWarning && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="No organization selected"
          description="Select an organization to manage private drafts. You can still view live public copies."
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
          )}
        />
      </Table>
    </List>
  );
};


