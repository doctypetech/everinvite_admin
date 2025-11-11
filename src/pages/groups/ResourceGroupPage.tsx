import { Button, Result, Space, Tabs, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router";

import {
  RESOURCE_GROUP_DEFINITION_MAP,
  type ResourceGroupDefinition,
} from "../../config/resourceGroups";
import { ResourceSection } from "../resources/ResourceSection";
import {
  ORGANIZATION_RELATED_GROUP_NAMES,
  TRIVIA_RESOURCE_NAMES,
} from "../resources/helpers";

type ResourceGroupPageProps = {
  groupName: string;
};

const renderHeader = (definition: ResourceGroupDefinition) => {
  return (
    <div>
      <Typography.Title level={2} style={{ marginBottom: 0 }}>
        {definition.label}
      </Typography.Title>
      {definition.sections.length > 1 && (
        <Typography.Text type="secondary">
          Manage all related resources from a single place.
        </Typography.Text>
      )}
    </div>
  );
};

export const ResourceGroupPage: React.FC<ResourceGroupPageProps> = ({
  groupName,
}) => {
  const definition = RESOURCE_GROUP_DEFINITION_MAP[groupName];
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const viewMode = searchParams.get("view");
  const organizationId =
    searchParams.get("organizationId") ?? searchParams.get("filters[0][value]");
  const showBackToOrganizations =
    ORGANIZATION_RELATED_GROUP_NAMES.has(groupName);

  if (!definition) {
    return (
      <Result
        status="404"
        title="Group not found"
        subTitle={`No resource group configured for "${groupName}".`}
      />
    );
  }

  const filteredSections = useMemo(() => {
    if (viewMode === "trivia") {
      return definition.sections.filter((section) =>
        TRIVIA_RESOURCE_NAMES.has(section.resource)
      );
    }
    return definition.sections.filter(
      (section) => !TRIVIA_RESOURCE_NAMES.has(section.resource)
    );
  }, [definition.sections, viewMode]);

  const effectiveSections =
    filteredSections.length > 0 ? filteredSections : definition.sections;

  const firstSectionKey = effectiveSections[0]?.resource ?? "";

  const [activeKey, setActiveKey] = useState<string>(firstSectionKey);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const hasTab = effectiveSections.some(
      (section) => section.resource === tabParam
    );
    if (tabParam && hasTab) {
      setActiveKey(tabParam);
      return;
    }
    setActiveKey(firstSectionKey);
  }, [effectiveSections, firstSectionKey, searchParams]);

  const items = useMemo(
    () =>
      effectiveSections.map((section) => ({
        key: section.resource,
        label: section.title ?? section.resource,
        children: (
          <ResourceSection
            resourceName={section.resource}
            title={section.title}
            organizationId={organizationId ?? undefined}
          />
        ),
      })),
    [effectiveSections, organizationId]
  );

  return (
    <div style={{ width: "100%", marginTop: 16 }}>
      {renderHeader(definition)}
      <Space style={{ marginTop: 16, marginBottom: 16 }} wrap>
        {showBackToOrganizations && (
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/organization")}
          >
            Back to Organizations
          </Button>
        )}
      </Space>
      <Tabs
        style={{ marginTop: showBackToOrganizations ? 0 : 16 }}
        activeKey={activeKey}
        onChange={(key) => {
          setActiveKey(key);
          const params = new URLSearchParams(location.search);
          if (key === firstSectionKey) {
            params.delete("tab");
          } else {
            params.set("tab", key);
          }
          navigate(
            { pathname: location.pathname, search: params.toString() },
            { replace: true },
          );
        }}
        destroyOnHidden={false}
        items={items}
      />
    </div>
  );
};

