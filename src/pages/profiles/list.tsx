import { EditButton, List, useTable } from "@refinedev/antd";
import { IResourceComponentsProps } from "@refinedev/core";
import { Space, Table, Typography } from "antd";
import { useMemo } from "react";
import { useUserEmailLookup } from "../../hooks/useUserEmailLookup";

const PROFILES_META = {
  select: "id, full_name, role, created_at",
} as const;

export const ProfilesList: React.FC<IResourceComponentsProps> = () => {
  const { tableProps } = useTable({
    resource: "profiles",
    meta: PROFILES_META,
  });

  const userIds = useMemo(
    () =>
      ((tableProps?.dataSource as Array<{ id?: string }> | undefined) ?? []).map(
        (row) => row.id
      ),
    [tableProps?.dataSource]
  );

  const { emailById, isLoading } = useUserEmailLookup(userIds);

  return (
    <List title="Profiles">
      <Table
        {...tableProps}
        rowKey="id"
        loading={tableProps.loading || isLoading}
      >
        <Table.Column dataIndex="full_name" title="Full Name" />
        <Table.Column
          dataIndex="id"
          title="Email"
          render={(value: string) =>
            emailById.get(value) ?? (
              <Typography.Text type="secondary">{value}</Typography.Text>
            )
          }
        />
        <Table.Column dataIndex="role" title="Role" />
        <Table.Column dataIndex="created_at" title="Created" />
        <Table.Column
          title="Actions"
          render={(_, record: { id: string }) => (
            <Space>
              <EditButton
                hideText
                size="small"
                resource="profiles"
                recordItemId={record.id}
              />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
