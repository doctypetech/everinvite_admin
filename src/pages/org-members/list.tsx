import { List, useTable, EditButton } from "@refinedev/antd";
import { IResourceComponentsProps } from "@refinedev/core";
import { Alert, Table } from "antd";
import { useMemo } from "react";
import { useOrg } from "../../contexts/org";

const ORG_MEMBERS_META = {
  select: "org_id, user_id, role, created_at, org:orgs(id, name, slug)",
} as const;

export const OrgMembersList: React.FC<IResourceComponentsProps> = () => {
  const { isPlatformAdmin } = useOrg();

  const tableConfig = useMemo(
    () => ({
      resource: "org_members",
      meta: ORG_MEMBERS_META,
    }),
    []
  );

  const { tableProps } = useTable(tableConfig);

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
        <Table.Column dataIndex="user_id" title="User ID" />
        <Table.Column dataIndex="role" title="Role" />
        <Table.Column dataIndex="created_at" title="Added" />
        <Table.Column
          title="Actions"
          render={(_, record: any) => (
            <EditButton
              hideText
              size="small"
              recordItemId={`${record.org_id}:${record.user_id}`}
              disabled={!isPlatformAdmin}
            />
          )}
        />
      </Table>
    </List>
  );
};


