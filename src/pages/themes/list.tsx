import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { IResourceComponentsProps } from "@refinedev/core";
import { Alert, Space, Table } from "antd";
import { useMemo } from "react";
import { usePlatformAccess } from "../../contexts/org";

const THEMES_META = {
  select:
    "id, template_id, name, palette, fonts, preview_thumb_url, template:templates(id, name)",
} as const;

export const ThemesList: React.FC<IResourceComponentsProps> = () => {
  const { isPlatformAdmin } = usePlatformAccess();

  const tableConfig = useMemo(
    () => ({
      resource: "themes",
      meta: THEMES_META,
    }),
    []
  );

  const { tableProps } = useTable(tableConfig);

  if (tableProps.loading) {
    return null;
  }

  return (
    <List
      title="Themes"
      createButtonProps={{
        disabled: !isPlatformAdmin,
        title: isPlatformAdmin
          ? undefined
          : "Only platform admins can create themes",
      }}
    >
      {!isPlatformAdmin && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Read-only access"
          description="You can view themes but only platform admins can modify them."
        />
      )}
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex={["template", "name"]}
          title="Template"
          render={(value: string) => value || "-"}
        />
        <Table.Column dataIndex="name" title="Theme Name" />
        <Table.Column
          dataIndex="palette"
          title="Palette"
          render={(value: any) => JSON.stringify(value)}
        />
        <Table.Column
          dataIndex="fonts"
          title="Fonts"
          render={(value: any) => JSON.stringify(value)}
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


