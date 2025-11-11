import { Button, Result, Space, Tabs, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";

import {
  RESOURCE_GROUP_DEFINITION_MAP,
  type ResourceGroupDefinition,
} from "../../config/resourceGroups";
import { ResourceSection } from "../resources/ResourceSection";
import { ORGANIZATION_RELATED_GROUP_NAMES } from "../resources/helpers";

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

  const firstSectionKey = definition.sections[0]?.resource ?? "";

  const [activeKey, setActiveKey] = useState<string>(firstSectionKey);

  useEffect(() => {
    setActiveKey(firstSectionKey);
  }, [firstSectionKey, groupName]);

  const items = useMemo(
    () =>
      definition.sections.map((section) => ({
        key: section.resource,
        label: section.title ?? section.resource,
        children: (
          <ResourceSection
            resourceName={section.resource}
            title={section.title}
          />
        ),
      })),
    [definition.sections]
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
        onChange={setActiveKey}
        destroyInactiveTabPane={false}
        items={items}
      />
    </div>
  );
};

