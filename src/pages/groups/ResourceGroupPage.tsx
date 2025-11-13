import { Button, Result, Tabs, Typography, theme } from "antd";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router";

import { RESOURCE_GROUP_DEFINITION_MAP } from "../../config/resourceGroups";
import { ResourceSection } from "../resources/ResourceSection";
import {
  ORGANIZATION_RELATED_GROUP_NAMES,
  TRIVIA_RESOURCE_NAMES,
  TRANSLATION_RESOURCE_SET,
} from "../resources/helpers";

type ResourceGroupPageProps = {
  groupName: string;
};

export const ResourceGroupPage: React.FC<ResourceGroupPageProps> = ({
  groupName,
}) => {
  const definition = RESOURCE_GROUP_DEFINITION_MAP[groupName];
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const viewMode = searchParams.get("view");
  const organizationId =
    searchParams.get("organizationId") ?? searchParams.get("filters[0][value]");
  const showBackToOrganizations =
    ORGANIZATION_RELATED_GROUP_NAMES.has(groupName) || viewMode === "trivia";

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
    const nonTranslationSections = definition.sections.filter(
      (section) => !TRANSLATION_RESOURCE_SET.has(section.resource)
    );

    if (viewMode === "trivia") {
      return nonTranslationSections.filter((section) =>
        TRIVIA_RESOURCE_NAMES.has(section.resource)
      );
    }
    return nonTranslationSections.filter(
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

  const displayLabel = viewMode === "trivia" ? "Trivia" : definition.label;
  const hasMultipleSections = effectiveSections.length > 1;

  return (
    <div style={{ width: "100%", marginTop: 16 }}>
      <div
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          padding: 24,
          boxShadow: token.boxShadowSecondary,
          width: "100%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            rowGap: 12,
            columnGap: 16,
          }}
        >
          <div>
            <Typography.Title level={3} style={{ marginBottom: 4 }}>
              {displayLabel}
            </Typography.Title>
            {hasMultipleSections && (
              <Typography.Text type="secondary">
                Manage all related resources from a single place.
              </Typography.Text>
            )}
          </div>
          {showBackToOrganizations && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => {
                const params = new URLSearchParams(location.search);
                params.delete("view");
                params.delete("tab");
                Array.from(params.keys()).forEach((key) => {
                  if (key.startsWith("filters[")) {
                    params.delete(key);
                  }
                });
                params.delete("organizationId");
                const searchString = params.toString();
                navigate({
                  pathname: "/admin/organization",
                  search: searchString ? `?${searchString}` : "",
                });
              }}
            >
              Back to Organizations
            </Button>
          )}
        </div>
        <Tabs
          style={{ marginTop: 24 }}
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
              { replace: true }
            );
          }}
          destroyOnHidden={false}
          items={items}
        />
      </div>
    </div>
  );
};
