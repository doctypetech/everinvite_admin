import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { IResourceComponentsProps } from "@refinedev/core";
import { Alert, Space, Table, Typography } from "antd";
import { useMemo } from "react";
import { usePlatformAccess } from "../../contexts/org";
import { useUserEmailLookup } from "../../hooks/useUserEmailLookup";

const ORG_MEMBERS_META = {
  select: "org_id, user_id, role, created_at, org:orgs(id, name, slug)",
} as const;

export const OrgMembersList: React.FC<IResourceComponentsProps> = () => {
  const { isPlatformAdmin } = usePlatformAccess();

  const tableConfig = useMemo(
    () => ({
      resource: "org_members",
      meta: ORG_MEMBERS_META,
    }),
    []
  );

  const { tableProps } = useTable(tableConfig);
  const userIds = useMemo(
    () =>
      ((tableProps?.dataSource as Array<{ user_id?: string }> | undefined) ?? []).map(
        (row) => row.user_id
      ),
    [tableProps?.dataSource]
  );
  const { emailById } = useUserEmailLookup(userIds);

  if (tableProps.loading) {
    return null;
  }

  return (
    <List
      title="Organization Members"
      createButtonProps={{
        disabled: !isPlatformAdmin,
        title: isPlatformAdmin
          ? undefined
          : "Only platform admins can add org members",
      }}
    >
      {!isPlatformAdmin && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Restricted resource"
          description="Only platform admins can manage organization memberships."
        />
      )}
      <Table
        {...tableProps}
        rowKey={(row: any) => `${row.org_id}:${row.user_id}`}
      >
        <Table.Column
          dataIndex={["org", "name"]}
          title="Organization"
          render={(value: string) => value || "-"}
        />
        <Table.Column
          dataIndex="user_id"
          title="Email"
          render={(value: string) =>
            emailById.get(value) ?? (
              <Typography.Text type="secondary">{value}</Typography.Text>
            )
          }
        />
        <Table.Column dataIndex="role" title="Role" />
        <Table.Column dataIndex="created_at" title="Added" />
        <Table.Column
          title="Actions"
          render={(_, record: any) => (
            <Space>
              <EditButton
                hideText
                size="small"
                recordItemId={`${record.org_id}:${record.user_id}`}
                disabled={!isPlatformAdmin}
              />
              <DeleteButton
                hideText
                size="small"
                recordItemId={`${record.org_id}:${record.user_id}`}
                disabled={!isPlatformAdmin}
              />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};


