import { Select, Tag, Typography } from "antd";
import { useMemo } from "react";
import { useOrg } from "../../contexts/org";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export const OrgSwitcher = () => {
  const { memberships, activeMembership, setActiveOrgId, loading } = useOrg();

  const options = useMemo(
    () =>
      memberships.map((membership) => ({
        value: membership.orgId,
        label: membership.org.name,
        role: membership.role,
      })),
    [memberships]
  );

  if (!memberships.length) {
    return (
      <Typography.Text type="secondary">
        No organization access
      </Typography.Text>
    );
  }

  return (
    <Select
      style={{ minWidth: 220 }}
      value={activeMembership?.orgId}
      placeholder="Select organization"
      onChange={(value) => setActiveOrgId(String(value))}
      loading={loading}
      options={options.map(({ value, label, role }) => ({
        value,
        label: (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{label}</span>
            <Tag>{ROLE_LABELS[role] ?? role}</Tag>
          </div>
        ),
      }))}
      optionLabelProp="label"
    />
  );
};


