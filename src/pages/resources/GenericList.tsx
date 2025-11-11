import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { useParsed } from "@refinedev/core";
import {
  Alert,
  Button,
  Result,
  Space,
  Table,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  RESOURCE_DEFINITION_MAP,
  type ResourceDefinition,
} from "../../config/resourceDefinitions";
import {
  formatCellValue,
  ORGANIZATION_RELATED_RESOURCE_NAMES,
  ORGANIZATION_RELATED_RESOURCES,
  buildOrganizationResourceListUrl,
} from "./helpers";

const getResourceDefinition = (name?: string): ResourceDefinition | undefined =>
  name ? RESOURCE_DEFINITION_MAP[name] : undefined;

const ORGANIZATION_ACTION_ICON_MAP: Record<string, ReactNode> = {
  invitees: <UsergroupAddOutlined />,
  event_content: <FileTextOutlined />,
  trivia_questions: <QuestionCircleOutlined />,
};

export const GenericList: React.FC = () => {
  const { resource } = useParsed();
  const resourceName =
    typeof resource === "string" ? resource : resource?.name;
  const definition = getResourceDefinition(resourceName);
  const navigate = useNavigate();
  const isOrganizationRelatedResource = definition
    ? ORGANIZATION_RELATED_RESOURCE_NAMES.has(definition.name)
    : false;

  const getRecordId = useMemo(
    () =>
      definition?.getRecordId ??
      ((record: Record<string, any>) => String(record.id)),
    [definition?.getRecordId]
  );

  const { tableProps } = useTable({
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

  return (
    <List
      title={definition.label}
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
          {defaultButtons}
        </Space>
      )}
    >
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
                    const to = buildOrganizationResourceListUrl(
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


