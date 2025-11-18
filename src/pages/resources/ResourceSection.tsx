import {
  CreateButton,
  DeleteButton,
  EditButton,
  List,
  useTable,
} from "@refinedev/antd";
import { Alert, Button, Result, Space, Table, Tooltip, Drawer, Descriptions, Typography, message } from "antd";
import {
  FileTextOutlined,
  UsergroupAddOutlined,
  BulbOutlined,
  GlobalOutlined,
  EyeOutlined,
  FileExcelOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { InviteeExcelImport } from "../../components/InviteeExcelImport";
import * as XLSX from "xlsx";
import { supabaseClient } from "../../utility";

import {
  RESOURCE_DEFINITION_MAP,
  type ResourceDefinition,
} from "../../config/resourceDefinitions";
import {
  formatCellValue,
  ORGANIZATION_RELATED_RESOURCES,
  buildTranslationResourceListUrl,
  getTranslationLinkConfig,
  buildOrganizationResourceListUrl,
  buildOrganizationGroupUrl,
  resolveResourceGroupForResource,
  resolveOrgFilterField,
} from "./helpers";
import type { CrudFilters } from "@refinedev/core";

const getResourceDefinition = (
  name?: string,
): ResourceDefinition | undefined =>
  name ? RESOURCE_DEFINITION_MAP[name] : undefined;

const ORGANIZATION_ACTION_ICON_MAP: Record<string, ReactNode> = {
  invitees: <UsergroupAddOutlined />,
  organization_content: <FileTextOutlined />,
  trivia_questions: <BulbOutlined />,
};

const TRANSLATION_ACTION_ICON = <GlobalOutlined />;
const VIEW_ACTION_ICON = <EyeOutlined />;

export type ResourceSectionProps = {
  resourceName: string;
  title?: string;
  organizationId?: string;
};

export const ResourceSection: React.FC<ResourceSectionProps> = ({
  resourceName,
  title,
  organizationId,
}) => {
  const definition = getResourceDefinition(resourceName);
  const navigate = useNavigate();
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<Record<string, any> | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const getRecordId = useMemo(
    () =>
      definition?.getRecordId ??
      ((record: Record<string, any>) => String(record.id)),
    [definition?.getRecordId],
  );

  const organizationFilterField =
    organizationId && definition
      ? resolveOrgFilterField(definition)
      : undefined;

  const baseInitialFilters = useMemo<CrudFilters>(
    () => [...(definition?.list?.initialFilters ?? [])],
    [definition?.list?.initialFilters],
  );

  const organizationFilters = useMemo<CrudFilters | undefined>(() => {
    if (!organizationFilterField) {
      return undefined;
    }
    return [
      {
        field: organizationFilterField,
        operator: "eq",
        value: organizationId,
      },
    ];
  }, [organizationFilterField, organizationId]);

  const filtersConfig = useMemo(() => {
    if (
      baseInitialFilters.length === 0 &&
      (organizationFilters?.length ?? 0) === 0
    ) {
      return undefined;
    }

    const initialFilters = organizationFilters
      ? [...baseInitialFilters, ...organizationFilters]
      : [...baseInitialFilters];

    return {
      initial: initialFilters,
      ...(organizationFilters ? { permanent: organizationFilters } : {}),
    };
  }, [baseInitialFilters, organizationFilters]);

  const { tableProps, tableQuery } = useTable({
    resource: resourceName,
    meta: definition?.list?.meta,
    sorters: {
      initial: definition?.list?.initialSorters,
    },
    filters: filtersConfig,
    syncWithLocation: false,
  });

  const handleExportExcel = async () => {
    if (!organizationId) {
      message.error("Organization ID is required for export");
      return;
    }

    setExporting(true);
    try {
      // Get base URL from environment variable
      const baseUrl = import.meta.env.VITE_FRONTEND_URL || "http://localhost:3000";

      // Fetch organization to get slug
      const { data: organization, error: orgError } = await supabaseClient
        .from("organizations")
        .select("slug")
        .eq("id", organizationId)
        .single();

      if (orgError || !organization) {
        message.error("Failed to fetch organization");
        return;
      }

      // Fetch all invitees with access_code for this organization
      const { data: invitees, error: inviteesError } = await supabaseClient
        .from("invitees")
        .select("full_name, phone_number, access_code")
        .eq("organization_id", organizationId);

      if (inviteesError) {
        message.error("Failed to fetch invitees");
        return;
      }

      if (!invitees || invitees.length === 0) {
        message.warning("No invitees found to export");
        return;
      }

      // Prepare data for Excel
      const excelData = invitees.map((invitee) => {
        const link = `${baseUrl}/${organization.slug}?access_code=${invitee.access_code}`;
        return {
          "Full Name": invitee.full_name || "",
          "Phone Number": invitee.phone_number || "",
          "Link": link,
        };
      });

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Invitees");

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `invitees_${organization.slug}_${timestamp}.xlsx`;

      // Write file
      XLSX.writeFile(workbook, filename);

      message.success(`Exported ${invitees.length} invitee(s) to ${filename}`);
    } catch (error: any) {
      console.error("Export error:", error);
      message.error(`Export failed: ${error.message || "Unknown error"}`);
    } finally {
      setExporting(false);
    }
  };

  if (!definition) {
    return (
      <Result
        status="404"
        title="Resource not configured"
        subTitle={`Missing configuration for resource "${resourceName}".`}
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
          tableQuery?.error?.message ??
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
      title={title ?? definition.label}
      resource={resourceName}
      breadcrumb={false}
      headerButtons={({ createButtonProps, defaultButtons }) => {
        if (!createButtonProps) {
          return defaultButtons ?? null;
        }

        const button = organizationId ? (
          <CreateButton
            {...createButtonProps}
            meta={{
              ...(createButtonProps.meta ?? {}),
              query: {
                ...(createButtonProps.meta?.query ?? {}),
                organizationId,
              },
            }}
          />
        ) : (
          <CreateButton {...createButtonProps} />
        );

        return (
          <Space wrap>
            {button}
            {resourceName === "invitees" && (
              <>
                {tableProps?.dataSource && tableProps.dataSource.length > 0 && (
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleExportExcel}
                    loading={exporting}
                    disabled={!organizationId || exporting}
                  >
                    Export Excel
                  </Button>
                )}
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={() => setImportModalOpen(true)}
                >
                  Import Excel
                </Button>
              </>
            )}
          </Space>
        );
      }}
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
                {resourceName === "organizations" &&
                  ORGANIZATION_RELATED_RESOURCES.map(({ resource, label }) => {
                    const groupForResource =
                      resolveResourceGroupForResource(resource);
                    const to =
                      groupForResource === "organization"
                        ? buildOrganizationGroupUrl(
                            groupForResource,
                            organizationId,
                            resource,
                          )
                        : buildOrganizationResourceListUrl(
                            resource,
                            organizationId,
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
                {resourceName === "organization_content" && (
                  <Tooltip title="View Details" key="view">
                    <Button
                      size="small"
                      icon={VIEW_ACTION_ICON}
                      aria-label="View Details"
                      onClick={() => {
                        setViewingRecord(record);
                        setViewDrawerOpen(true);
                      }}
                    />
                  </Tooltip>
                )}
                {(() => {
                  const translationConfig =
                    getTranslationLinkConfig(resourceName);
                  if (!translationConfig) {
                    return null;
                  }

                  const to = buildTranslationResourceListUrl(
                    resourceName,
                    recordId,
                  );

                  if (!to) {
                    return null;
                  }

                  return (
                    <Tooltip title={translationConfig.label} key="translations">
                      <Button
                        size="small"
                        icon={TRANSLATION_ACTION_ICON}
                        aria-label={translationConfig.label}
                        onClick={() => navigate(to)}
                      />
                    </Tooltip>
                  );
                })()}
                <EditButton
                  size="small"
                  hideText
                  resource={resourceName}
                  recordItemId={recordId}
                />
                {definition.canDelete !== false && (
                  <DeleteButton
                    size="small"
                    hideText
                    resource={resourceName}
                    recordItemId={recordId}
                  />
                )}
              </Space>
            );
          }}
        />
      </Table>
      {resourceName === "organization_content" && (
        <Drawer
          title="Content Details"
          placement="right"
          width={600}
          open={viewDrawerOpen}
          onClose={() => {
            setViewDrawerOpen(false);
            setViewingRecord(null);
          }}
        >
          {viewingRecord && (
            <ContentDetailsView record={viewingRecord} />
          )}
        </Drawer>
      )}
      {resourceName === "invitees" && (
        <InviteeExcelImport
          open={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          organizationId={organizationId || ""}
          onSuccess={() => {
            tableQuery?.refetch();
          }}
        />
      )}
    </List>
  );
};

const ContentDetailsView: React.FC<{ record: Record<string, any> }> = ({ record }) => {
  const data = record as Record<string, any>;
  const content = data.content as Record<string, any> | undefined;
  const event = content?.event as Record<string, any> | undefined;
  const location = content?.location as Record<string, any> | undefined;
  const buttons = content?.buttons as Record<string, any> | undefined;
  const primaryButton = buttons?.primary_button as Record<string, any> | undefined;

  return (
    <Descriptions column={1} bordered>
      <Descriptions.Item label="ID">{data.id ?? "—"}</Descriptions.Item>
      <Descriptions.Item label="Order">{data.order ?? "—"}</Descriptions.Item>
      <Descriptions.Item label="Organization">
        {data.organization?.name ?? data.organization_id ?? "—"}
      </Descriptions.Item>
      <Descriptions.Item label="Slide Type">
        {data.slide_type?.name ?? data.slide_type_id ?? "—"}
      </Descriptions.Item>
      <Descriptions.Item label="Image Path">
        {data.image_path ? (
          <a href={data.image_path} target="_blank" rel="noopener noreferrer">
            {data.image_path}
          </a>
        ) : (
          "—"
        )}
      </Descriptions.Item>
      <Descriptions.Item label="Title">
        {content?.title ?? "—"}
      </Descriptions.Item>
      <Descriptions.Item label="Subtitle">
        {content?.sub_title ?? "—"}
      </Descriptions.Item>
      <Descriptions.Item label="Event Date">
        {event?.date ?? "—"}
      </Descriptions.Item>
      <Descriptions.Item label="Event Time">
        {event?.time ?? "—"}
      </Descriptions.Item>
      <Descriptions.Item label="Location Name">
        {location?.name ?? "—"}
      </Descriptions.Item>
      <Descriptions.Item label="Location URL">
        {location?.url ? (
          <a href={location.url} target="_blank" rel="noopener noreferrer">
            {location.url}
          </a>
        ) : (
          "—"
        )}
      </Descriptions.Item>
      <Descriptions.Item label="Host Name">
        {content?.host_name ?? "—"}
      </Descriptions.Item>
      <Descriptions.Item label="Body HTML">
        {content?.content ? (
          <Typography.Paragraph>
            <div dangerouslySetInnerHTML={{ __html: content.content }} />
          </Typography.Paragraph>
        ) : (
          "—"
        )}
      </Descriptions.Item>
      <Descriptions.Item label="Primary Button Text">
        {primaryButton?.text ?? "—"}
      </Descriptions.Item>
      <Descriptions.Item label="Primary Button Link">
        {primaryButton?.action_link ? (
          <a href={primaryButton.action_link} target="_blank" rel="noopener noreferrer">
            {primaryButton.action_link}
          </a>
        ) : (
          "—"
        )}
      </Descriptions.Item>
      <Descriptions.Item label="Created At">
        {data.created_at ? new Date(data.created_at).toLocaleString() : "—"}
      </Descriptions.Item>
      <Descriptions.Item label="Updated At">
        {data.updated_at ? new Date(data.updated_at).toLocaleString() : "—"}
      </Descriptions.Item>
    </Descriptions>
  );
};

