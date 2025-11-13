import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { useParsed } from "@refinedev/core";
import {
  Alert,
  Button,
  Result,
  Space,
  Table,
  Tabs,
  Tooltip,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  UsergroupAddOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { useMemo, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  RESOURCE_DEFINITION_MAP,
  type ResourceDefinition,
} from "../../config/resourceDefinitions";
import {
  formatCellValue,
  ORGANIZATION_RELATED_RESOURCE_NAMES,
  ORGANIZATION_RELATED_RESOURCES,
  TRANSLATION_RESOURCE_SET,
  buildBaseResourceListUrlFromTranslation,
  getTranslationConfigForResource,
  buildOrganizationResourceListUrl,
  resolveOrgFilterField,
  buildOrganizationGroupUrl,
  resolveResourceGroupForResource,
  TRIVIA_RESOURCE_NAMES,
} from "./helpers";
import {
  RESOURCE_GROUP_DEFINITION_MAP,
  RESOURCE_GROUP_NAME_BY_RESOURCE,
  RESOURCE_GROUP_ROUTE_BY_RESOURCE,
} from "../../config/resourceGroups";

const getResourceDefinition = (name?: string): ResourceDefinition | undefined =>
  name ? RESOURCE_DEFINITION_MAP[name] : undefined;

const ORGANIZATION_ACTION_ICON_MAP: Record<string, ReactNode> = {
  invitees: <UsergroupAddOutlined />,
  organization_content: <FileTextOutlined />,
  trivia_questions: <BulbOutlined />,
};

type GroupNavigationTab = {
  key: string;
  label: string;
  path: string;
  filterField?: string;
};

export const GenericList: React.FC = () => {
  const { resource } = useParsed();
  const resourceName = typeof resource === "string" ? resource : resource?.name;
  const definition = getResourceDefinition(resourceName);
  const navigate = useNavigate();
  const location = useLocation();
  const isOrganizationRelatedResource = definition
    ? ORGANIZATION_RELATED_RESOURCE_NAMES.has(definition.name)
    : false;
  const groupName = resourceName
    ? RESOURCE_GROUP_NAME_BY_RESOURCE[resourceName]
    : undefined;
  const groupDefinition = groupName
    ? RESOURCE_GROUP_DEFINITION_MAP[groupName]
    : undefined;
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const viewMode = searchParams.get("view");
  const currentFilterField = searchParams.get("filters[0][field]");
  const currentFilterValue = searchParams.get("filters[0][value]");
  const organizationIdParam =
    searchParams.get("organizationId") ?? currentFilterValue ?? undefined;
  const translationConfig = definition
    ? getTranslationConfigForResource(definition.name)
    : undefined;

  const filteredGroupSections = useMemo(() => {
    if (!groupDefinition) {
      return [];
    }

    const nonTranslationSections = groupDefinition.sections.filter(
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
  }, [groupDefinition, viewMode]);

  const showGroupTabs = !translationConfig && filteredGroupSections.length > 1;

  const groupNavigationTabs = useMemo<GroupNavigationTab[]>(() => {
    if (!showGroupTabs || !groupDefinition) {
      return [];
    }

    const tabs: GroupNavigationTab[] = [];

    filteredGroupSections.forEach((section) => {
      const sectionDefinition = RESOURCE_DEFINITION_MAP[section.resource];
      const listPath = sectionDefinition?.routes.list;
      const filterField = resolveOrgFilterField(sectionDefinition);

      if (!sectionDefinition || !listPath) {
        return;
      }

      tabs.push({
        key: section.resource,
        label: section.title ?? sectionDefinition.label,
        path: listPath,
        filterField,
      });
    });

    return tabs;
  }, [filteredGroupSections, showGroupTabs]);

  const getRecordId = useMemo(
    () =>
      definition?.getRecordId ??
      ((record: Record<string, any>) => String(record.id)),
    [definition?.getRecordId]
  );

  const baseResourceDefinition = translationConfig
    ? RESOURCE_DEFINITION_MAP[translationConfig.sourceResource]
    : undefined;
  const groupRouteForSource = translationConfig
    ? RESOURCE_GROUP_ROUTE_BY_RESOURCE[translationConfig.sourceResource]
    : undefined;
  const baseRecordId = currentFilterValue ?? undefined;

  let translationBackUrl: string | undefined;
  if (translationConfig) {
    if (groupRouteForSource) {
      const params = new URLSearchParams();
      params.set("tab", translationConfig.sourceResource);
      if (organizationIdParam) {
        params.set("organizationId", organizationIdParam);
      }
      const search = params.toString();
      translationBackUrl = search.length
        ? `${groupRouteForSource}?${search}`
        : groupRouteForSource;
    } else if (baseRecordId) {
      translationBackUrl = buildBaseResourceListUrlFromTranslation(
        definition?.name ?? "",
        baseRecordId
      );
    }
    if (!translationBackUrl) {
      translationBackUrl = baseResourceDefinition?.routes.list;
    }
  }

  const translationBackLabel =
    translationConfig && baseResourceDefinition
      ? baseResourceDefinition.label
      : translationConfig?.label;

  const listTitle = translationConfig ? (
    <div>
      <Typography.Title level={2} style={{ marginBottom: 4 }}>
        {translationConfig.label}
      </Typography.Title>
      <Typography.Text type="secondary">
        Manage translations for{" "}
        {baseResourceDefinition?.label ?? "this resource"}.
      </Typography.Text>
    </div>
  ) : (
    definition.label
  );

  const { tableProps, tableQuery } = useTable({
    resource: resourceName,
    meta: definition?.list?.meta,
    sorters: {
      initial: definition?.list?.initialSorters,
    },
    filters: {
      initial: definition?.list?.initialFilters,
    },
  });

  if (!definition) {
    return (
      <Result
        status="404"
        title="Resource not configured"
        subTitle="The current resource is missing configuration. Please update resourceDefinitions.ts."
      />
    );
  }

  if (!definition.list) {
    return (
      <Alert
        type="warning"
        message="List view unavailable"
        description="This resource does not define a list configuration."
      />
    );
  }

  if (tableQuery?.isError) {
    return (
      <Result
        status="error"
        title="Failed to load data"
        subTitle={
          tableQuery.error?.message ??
          "An unexpected error occurred while loading this resource."
        }
        extra={
          <Button type="primary" onClick={() => tableQuery.refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <List
      title={listTitle}
      resource={definition.name}
      headerButtons={({ defaultButtons }) => (
        <Space wrap>
          {isOrganizationRelatedResource && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/admin/organization")}
            >
              Back to Organizations
            </Button>
          )}
          {translationConfig && translationBackUrl && translationBackLabel && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(translationBackUrl!)}
            >
              Back to {translationBackLabel}
            </Button>
          )}
          {defaultButtons}
        </Space>
      )}
    >
      {groupNavigationTabs.length > 0 && (
        <Tabs
          activeKey={definition.name}
          onChange={(key) => {
            const tab = groupNavigationTabs.find((item) => item.key === key);
            if (!tab) {
              return;
            }

            const params = new URLSearchParams(location.search);
            params.delete("filters[0][field]");
            params.delete("filters[0][operator]");
            params.delete("filters[0][value]");
            params.delete("tab");

            if (currentFilterValue && tab.filterField) {
              params.set("filters[0][field]", tab.filterField);
              params.set("filters[0][operator]", "eq");
              params.set("filters[0][value]", currentFilterValue);
            }

            if (organizationIdParam) {
              params.set("organizationId", organizationIdParam);
            } else {
              params.delete("organizationId");
            }

            if (TRIVIA_RESOURCE_NAMES.has(tab.key)) {
              params.set("view", "trivia");
            } else if (params.get("view") === "trivia") {
              params.delete("view");
            }

            if (tab.key !== groupNavigationTabs[0]?.key) {
              params.set("tab", tab.key);
            } else {
              params.delete("tab");
            }

            const searchString = params.toString();
            navigate({
              pathname: tab.path,
              search: searchString ? `?${searchString}` : "",
            });
          }}
          items={groupNavigationTabs.map((tab) => ({
            key: tab.key,
            label: tab.label,
          }))}
          style={{ marginBottom: 16 }}
        />
      )}
      <Table
        {...tableProps}
        rowKey={(record) => getRecordId(record as Record<string, any>)}
        scroll={{ x: true }}
      >
        {definition.list.columns.map((column) => (
          <Table.Column
            key={column.key}
            dataIndex={column.key}
            title={column.title}
            width={column.width}
            render={(value, record: Record<string, unknown>) =>
              column.render
                ? column.render(value, record)
                : formatCellValue(value, column.type)
            }
          />
        ))}
        <Table.Column<Record<string, any>>
          fixed="right"
          title="Actions"
          render={(_, record) => {
            const recordId = getRecordId(record);
            const organizationId =
              (record as Record<string, any>).id ?? recordId;
            return (
              <Space>
                {definition.name === "organizations" &&
                  ORGANIZATION_RELATED_RESOURCES.map(({ resource, label }) => {
                    const groupForResource =
                      resolveResourceGroupForResource(resource);
                    const to =
                      groupForResource === "organization"
                        ? buildOrganizationGroupUrl(
                            groupForResource,
                            organizationId,
                            resource
                          )
                        : buildOrganizationResourceListUrl(
                            resource,
                            organizationId
                          );
                    const icon = ORGANIZATION_ACTION_ICON_MAP[resource];

                    if (!to || !icon) {
                      return null;
                    }

                    return (
                      <Tooltip title={label} key={resource}>
                        <Button
                          size="small"
                          icon={icon}
                          aria-label={label}
                          onClick={() => navigate(to)}
                        />
                      </Tooltip>
                    );
                  })}
                <EditButton
                  size="small"
                  hideText
                  resource={definition.name}
                  recordItemId={recordId}
                />
                {definition.canDelete !== false && (
                  <DeleteButton
                    size="small"
                    hideText
                    resource={definition.name}
                    recordItemId={recordId}
                  />
                )}
              </Space>
            );
          }}
        />
      </Table>
    </List>
  );
};
