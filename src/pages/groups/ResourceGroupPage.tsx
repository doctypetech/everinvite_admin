import { Result, Tabs, Typography } from "antd";

import {
  RESOURCE_GROUP_DEFINITION_MAP,
  type ResourceGroupDefinition,
} from "../../config/resourceGroups";
import { ResourceSection } from "../resources/ResourceSection";

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

  if (!definition) {
    return (
      <Result
        status="404"
        title="Group not found"
        subTitle={`No resource group configured for "${groupName}".`}
      />
    );
  }

  const items = definition.sections.map((section) => ({
    key: section.resource,
    label: section.title ?? section.resource,
    children: (
      <ResourceSection
        resourceName={section.resource}
        title={section.title}
      />
    ),
  }));

  return (
    <div style={{ width: "100%", marginTop: 16 }}>
      {renderHeader(definition)}
      <Tabs
        style={{ marginTop: 16 }}
        defaultActiveKey={definition.sections[0]?.resource}
        destroyInactiveTabPane={false}
        items={items}
      />
    </div>
  );
};

