import { useState } from "react";
import { Modal, Upload, Button, message, Progress, Alert, Typography } from "antd";
import { UploadOutlined, FileExcelOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import * as XLSX from "xlsx";
import { supabaseClient } from "../utility";
import type { RcFile } from "antd/es/upload";

const { Text } = Typography;

interface InviteeExcelImportProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  onSuccess?: () => void;
}

interface ParsedInvitee {
  full_name: string;
  phone_number: string;
  company?: string;
  max_guests_allowed?: number;
  attending_guests?: number;
  status?: string;
  access_code?: string;
  organization_id: string;
}

// Generate a unique access code
const generateAccessCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding confusing characters
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Normalize phone number (remove spaces, dashes, etc.)
const normalizePhoneNumber = (phone: string): string => {
  return phone.replace(/[\s\-\(\)]/g, "");
};

export const InviteeExcelImport: React.FC<InviteeExcelImportProps> = ({
  open,
  onClose,
  organizationId,
  onSuccess,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    created: number;
    updated: number;
    failed: number;
  } | null>(null);

  const handleRemove = () => {
    setFileList([]);
    setErrors([]);
    setStats(null);
    setProgress(0);
  };

  const parseExcelFile = async (file: File): Promise<ParsedInvitee[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            defval: "",
          }) as Record<string, any>[];

          const parsed: ParsedInvitee[] = [];
          const validationErrors: string[] = [];

          jsonData.forEach((row, index) => {
            const rowNum = index + 2; // +2 because Excel rows start at 1 and we have a header

            // Normalize column names (case-insensitive, handle spaces/underscores)
            const normalizeKey = (key: string) =>
              key.toLowerCase().replace(/[\s_]/g, "");

            const rowMap: Record<string, any> = {};
            Object.keys(row).forEach((key) => {
              rowMap[normalizeKey(key)] = row[key];
            });

            const fullName = String(rowMap["fullname"] || rowMap["full_name"] || "").trim();
            const phoneNumber = String(
              rowMap["phonenumber"] || rowMap["phone_number"] || ""
            ).trim();

            // Validate required fields
            if (!fullName) {
              validationErrors.push(`Row ${rowNum}: full_name is required`);
              return;
            }

            if (!phoneNumber) {
              validationErrors.push(`Row ${rowNum}: phone_number is required`);
              return;
            }

            // Parse optional fields
            const company = String(rowMap["company"] || "").trim() || undefined;
            const maxGuests = rowMap["maxguestsallowed"] || rowMap["max_guests_allowed"];
            const attendingGuests = rowMap["attendingguests"] || rowMap["attending_guests"];
            const status = String(rowMap["status"] || "pending").trim().toLowerCase();
            const accessCode = String(rowMap["accesscode"] || rowMap["access_code"] || "").trim();

            // Validate status
            const validStatuses = ["pending", "yes", "no", "maybe"];
            const finalStatus = validStatuses.includes(status) ? status : "pending";

            // Parse numbers
            const maxGuestsNum =
              maxGuests !== undefined && maxGuests !== ""
                ? Number(maxGuests)
                : undefined;
            const attendingGuestsNum =
              attendingGuests !== undefined && attendingGuests !== ""
                ? Number(attendingGuests)
                : undefined;

            parsed.push({
              full_name: fullName,
              phone_number: normalizePhoneNumber(phoneNumber),
              company,
              max_guests_allowed: maxGuestsNum ?? 2,
              attending_guests: attendingGuestsNum ?? 0,
              status: finalStatus,
              access_code: accessCode || generateAccessCode(),
              organization_id: organizationId,
            });
          });

          if (validationErrors.length > 0) {
            setErrors(validationErrors);
          }

          resolve(parsed);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const processBatch = async (
    batch: ParsedInvitee[],
    batchIndex: number,
    totalBatches: number
  ): Promise<{ created: number; updated: number }> => {
    // First, check which invitees already exist by phone_number
    const phoneNumbers = batch.map((inv) => inv.phone_number);
    const { data: existingInvitees, error: fetchError } = await supabaseClient
      .from("invitees")
      .select("id, phone_number")
      .eq("organization_id", organizationId)
      .in("phone_number", phoneNumbers);

    if (fetchError) {
      throw fetchError;
    }

    const existingMap = new Map(
      (existingInvitees || []).map((inv) => [inv.phone_number, inv.id])
    );

    const toCreate: ParsedInvitee[] = [];
    const toUpdate: Array<{ id: string; data: Partial<ParsedInvitee> }> = [];

    batch.forEach((invitee) => {
      const existingId = existingMap.get(invitee.phone_number);
      if (existingId) {
        // Update existing
        const { phone_number, organization_id, ...updateData } = invitee;
        toUpdate.push({ id: existingId, data: updateData });
      } else {
        // Create new
        toCreate.push(invitee);
      }
    });

    // Process creates
    if (toCreate.length > 0) {
      const { error: createError } = await supabaseClient
        .from("invitees")
        .insert(toCreate);

      if (createError) {
        throw createError;
      }
    }

    // Process updates (one by one to avoid conflicts)
    for (const updateItem of toUpdate) {
      const { error: updateError } = await supabaseClient
        .from("invitees")
        .update(updateItem.data)
        .eq("id", updateItem.id);

      if (updateError) {
        throw updateError;
      }
    }

    // Update progress
    const progressPercent = Math.round(
      ((batchIndex + 1) / totalBatches) * 100
    );
    setProgress(progressPercent);

    return {
      created: toCreate.length,
      updated: toUpdate.length,
    };
  };

  const handleImport = async () => {
    if (fileList.length === 0) {
      message.error("Please select an Excel file");
      return;
    }

    if (!organizationId || organizationId.trim() === "") {
      message.error("Organization ID is required. Please filter by organization first.");
      return;
    }

    // Get file from originFileObj or from the file object directly
    const file = (fileList[0].originFileObj as File) || (fileList[0] as any);
    if (!file) {
      message.error("File not found. Please select the file again.");
      return;
    }

    // Ensure it's a File object
    if (!(file instanceof File)) {
      message.error("Invalid file. Please select a valid Excel file.");
      return;
    }

    setLoading(true);
    setImporting(true);
    setErrors([]);
    setStats(null);
    setProgress(0);

    try {
      // Parse Excel file
      const parsedInvitees = await parseExcelFile(file);

      if (parsedInvitees.length === 0) {
        message.warning("No valid invitees found in the Excel file");
        setLoading(false);
        setImporting(false);
        return;
      }

      // Process in batches to avoid DB conflicts
      const BATCH_SIZE = 50; // Process 50 records at a time
      const batches: ParsedInvitee[][] = [];
      for (let i = 0; i < parsedInvitees.length; i += BATCH_SIZE) {
        batches.push(parsedInvitees.slice(i, i + BATCH_SIZE));
      }

      let created = 0;
      let updated = 0;
      let failed = 0;

      for (let i = 0; i < batches.length; i++) {
        try {
          const batch = batches[i];
          const result = await processBatch(batch, i, batches.length);
          created += result.created;
          updated += result.updated;
        } catch (error) {
          console.error(`Batch ${i + 1} failed:`, error);
          failed += batches[i].length;
        }
      }

      setStats({
        total: parsedInvitees.length,
        created,
        updated,
        failed,
      });

      if (failed === 0) {
        message.success(
          `Successfully imported ${parsedInvitees.length} invitee(s)`
        );
        onSuccess?.();
        handleRemove();
        onClose();
      } else {
        message.warning(
          `Imported ${created + updated} invitee(s), ${failed} failed`
        );
      }
    } catch (error: any) {
      console.error("Import error:", error);
      message.error(`Import failed: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
      setImporting(false);
    }
  };

  const handleFileChange: UploadProps["onChange"] = (info) => {
    if (info.file.status === "removed") {
      handleRemove();
      return;
    }

    // Get file from originFileObj or from the file object directly
    const file = info.file.originFileObj || (info.file as any);
    
    if (file) {
      // Primary validation: Check file extension (most reliable)
      const fileName = (file.name || "").toLowerCase();
      const fileExtension = fileName.includes(".") 
        ? fileName.substring(fileName.lastIndexOf("."))
        : "";
      
      const validExtensions = [".xlsx", ".xls"];
      const hasValidExtension = validExtensions.includes(fileExtension);

      // If no valid extension, reject
      if (!hasValidExtension) {
        message.error(
          "Invalid file type. Please upload only Excel files (.xlsx or .xls)"
        );
        setFileList([]);
        return;
      }

      // File is valid, add it to the list
      // Ensure the file object has the necessary properties including name
      const fileToAdd: UploadFile = {
        uid: info.file.uid || `-${Date.now()}`,
        name: file.name || info.file.name || "excel-file.xlsx",
        status: "done" as const,
        originFileObj: file,
        size: file.size,
        type: file.type,
      };
      
      setFileList([fileToAdd]);
      setErrors([]);
      setStats(null);
    } else {
      // If file is being processed, keep it in the list
      if (info.file.status === "uploading" || info.file.status === "done") {
        setFileList([info.file]);
      }
    }
  };

  const beforeUpload = (file: RcFile) => {
    // Validation before file is added to the list
    const fileName = (file.name || "").toLowerCase();
    const fileExtension = fileName.includes(".") 
      ? fileName.substring(fileName.lastIndexOf("."))
      : "";
    const validExtensions = [".xlsx", ".xls"];

    if (!validExtensions.includes(fileExtension)) {
      message.error("Only Excel files (.xlsx or .xls) are allowed");
      return Upload.LIST_IGNORE;
    }

    // Return false to prevent auto upload, but allow file to be added to list
    return false;
  };

  return (
    <Modal
      title={
        <span>
          <FileExcelOutlined style={{ marginRight: 8 }} />
          Import Invitees from Excel
        </span>
      }
      open={open}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={importing}>
          Cancel
        </Button>,
        <Button
          key="import"
          type="primary"
          onClick={handleImport}
          loading={loading}
          disabled={fileList.length === 0 || importing}
        >
          Import
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Upload an Excel file with columns: full_name, phone_number, company,
          max_guests_allowed, attending_guests, status, access_code
        </Text>
      </div>

      <Upload
        fileList={fileList}
        onChange={handleFileChange}
        beforeUpload={beforeUpload}
        accept=".xlsx,.xls"
        maxCount={1}
        multiple={false}
        showUploadList={{
          showRemoveIcon: true,
          showPreviewIcon: false,
          showDownloadIcon: false,
        }}
      >
        <Button icon={<UploadOutlined />}>Select Excel File (.xlsx or .xls only)</Button>
      </Upload>
      <div style={{ marginTop: 8, textAlign: "center" }}>
        <Text type="secondary">or drag and drop file here</Text>
      </div>

      {errors.length > 0 && (
        <Alert
          type="warning"
          message="Validation Errors"
          description={
            <div style={{ maxHeight: 200, overflow: "auto" }}>
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          }
          style={{ marginTop: 16 }}
        />
      )}

      {importing && (
        <div style={{ marginTop: 16 }}>
          <Progress percent={progress} status="active" />
          <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
            Importing invitees...
          </Text>
        </div>
      )}

      {stats && (
        <Alert
          type={stats.failed === 0 ? "success" : "warning"}
          message="Import Summary"
          description={
            <div>
              <div>Total: {stats.total}</div>
              <div>Created: {stats.created}</div>
              <div>Updated: {stats.updated}</div>
              {stats.failed > 0 && <div>Failed: {stats.failed}</div>}
            </div>
          }
          style={{ marginTop: 16 }}
        />
      )}

      <div style={{ marginTop: 16 }}>
        <Text strong>Note:</Text>
        <ul style={{ marginTop: 8, paddingLeft: 20 }}>
          <li>
            <Text type="secondary">
              <strong>full_name</strong> and <strong>phone_number</strong> are
              required fields
            </Text>
          </li>
          <li>
            <Text type="secondary">
              If an invitee with the same phone_number exists, it will be
              updated instead of created
            </Text>
          </li>
          <li>
            <Text type="secondary">
              Access codes will be auto-generated if not provided
            </Text>
          </li>
          <li>
            <Text type="secondary">
              Data is processed in batches to avoid database conflicts
            </Text>
          </li>
        </ul>
      </div>
    </Modal>
  );
};

