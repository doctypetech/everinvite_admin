import { List, useTable, DeleteButton } from "@refinedev/antd";
import { IResourceComponentsProps } from "@refinedev/core";
import { Alert, Table } from "antd";
import { useMemo } from "react";
import { useOrg } from "../../contexts/org";

const PLATFORM_ADMINS_META = {
  select: "user_id",
} as const;

export const PlatformAdminsList: React.FC<IResourceComponentsProps> = () => {
  const { isPlatformAdmin } = useOrg();

  const tableConfig = useMemo(
    () => ({
      resource: "platform_admins",
      meta: PLATFORM_ADMINS_META,
    }),
    []
  );

  const { tableProps } = useTable(tableConfig);

  if (tableProps.loading) {
    return null;
  }

  return (
    <List
      title="Platform Admins"
      createButtonProps={{
        disabled: !isPlatformAdmin,
        title: isPlatformAdmin
          ? undefined
          : "Only platform admins can add new platform admins",
      }}
    >
      {!isPlatformAdmin && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Restricted resource"
          description="Only existing platform admins can modify this list."
        />
      )}
      <Table {...tableProps} rowKey="user_id">
        <Table.Column dataIndex="user_id" title="User ID" />
        <Table.Column
          title="Actions"
          render={(_, record: { user_id: string }) => (
            <DeleteButton
              hideText
              size="small"
              recordItemId={record.user_id}
              resource="platform_admins"
              disabled={!isPlatformAdmin}
            />
          )}
        />
      </Table>
    </List>
  );
};


