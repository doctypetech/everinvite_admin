import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { CrudFilters, CrudSort, IResourceComponentsProps } from "@refinedev/core";
import { Alert, Space, Table, Tag, Typography } from "antd";
import { useMemo } from "react";
import { usePlatformAccess } from "../../contexts/org";

const STATUS_COLORS: Record<string, string> = {
  draft: "default",
  live: "green",
  archived: "orange",
};

const EVENTS_META = {
  select:
    "id, slug, status, date, time, venue, org_id, custom_label, show_guest_gallery",
} as const;

const EVENTS_SORTERS: CrudSort[] = [
  {
    field: "date",
    order: "desc",
  },
];

export const EventsList: React.FC<IResourceComponentsProps> = () => {
  const { loading, isPlatformAdmin } = usePlatformAccess();
  const canManage = isPlatformAdmin;

  const tableConfig = useMemo(
    () => ({
      resource: "events",
      meta: EVENTS_META,
      filters: {
        initial: [] as CrudFilters,
      },
      sorters: {
        initial: EVENTS_SORTERS,
      },
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
      title="Events"
      createButtonProps={{
        disabled: !canManage,
        title: canManage
          ? undefined
          : "Only platform admins can create events",
      }}
    >
      {!canManage && (
        <Alert
          type="warning"
          message="Restricted resource"
          description="Only platform admins can manage events."
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="slug" title="Slug" />
        <Table.Column
          dataIndex="status"
          title="Status"
          render={(value: string) => (
            <Tag color={STATUS_COLORS[value] ?? "default"}>{value}</Tag>
          )}
        />
        <Table.Column dataIndex="date" title="Date" />
        <Table.Column dataIndex="time" title="Time" />
        <Table.Column dataIndex="venue" title="Venue" />
        <Table.Column
          dataIndex="custom_label"
          title="Label"
          render={(value: string | null) =>
            value ? <Typography.Text>{value}</Typography.Text> : "-"
          }
        />
        <Table.Column
          dataIndex="show_guest_gallery"
          title="Guest Gallery"
          render={(value: boolean) => (value ? "Enabled" : "Hidden")}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: { id: number }) => (
            <Space>
              <EditButton
                size="small"
                hideText
                recordItemId={record.id}
                disabled={!canManage}
              />
              <DeleteButton
                size="small"
                hideText
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


