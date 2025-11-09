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
  const {
    memberships,
    activeMembership,
    setActiveOrgId,
    loading,
    isSuperAdmin,
  } = useOrg();

  const options = useMemo(
    () =>
      memberships.map((membership) => ({
        value: membership.orgId,
        label: membership.org.name,
        role: membership.role,
      })),
    [memberships]
  );

  if (!options.length) {
    return (
      <Typography.Text type="secondary">
        No organization access
      </Typography.Text>
    );
  }

  const showAllOption = isSuperAdmin || options.length > 0;
  const selectValue =
    activeMembership?.orgId ?? (showAllOption ? "__all__" : undefined);

  const selectOptions = [
    ...(showAllOption
      ? [
          {
            value: "__all__",
            label: (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>All organizations</span>
              </div>
            ),
          },
        ]
      : []),
    ...options.map(({ value, label, role }) => ({
      value,
      label: (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{label}</span>
          <Tag>{ROLE_LABELS[role] ?? role}</Tag>
        </div>
      ),
    })),
  ];

  return (
    <Select
      style={{ minWidth: 220 }}
      value={selectValue}
      placeholder="Select organization"
      onChange={(value) =>
        setActiveOrgId(value === "__all__" ? null : String(value))
      }
      loading={loading}
      options={selectOptions}
      optionLabelProp="label"
    />
  );
};


