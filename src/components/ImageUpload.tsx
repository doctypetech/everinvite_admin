import { useState, useEffect } from "react";
import { Upload, Button, Image, Space, message } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { supabaseClient } from "../utility";
import type { FieldDefinition } from "../config/resourceDefinitions";

type ImageUploadProps = {
  field: FieldDefinition;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string | null) => void;
  organizationId?: string;
  recordId?: string;
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  field,
  disabled,
  value,
  onChange,
  organizationId,
  recordId,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const storageOptions = field.storage;
  const bucket = storageOptions?.bucket || "organization_assets";
  const accept = storageOptions?.accept || ["image/*"];
  const maxSizeMB = storageOptions?.maxSizeMB || 10;

  useEffect(() => {
    if (value) {
      // If value is a full URL, extract the path, otherwise use as is
      let imagePath = value;

      // Check if it's a full public URL
      if (value.startsWith("/storage/v1/object/public/")) {
        // Extract path after bucket name
        const parts = value.split(
          "/storage/v1/object/public/organization_assets/"
        );
        imagePath = parts[1] || value;
      } else if (
        value.includes("storage/v1/object/public/organization_assets/")
      ) {
        const parts = value.split(
          "storage/v1/object/public/organization_assets/"
        );
        imagePath = parts[1] || value;
      }

      // Build public URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${imagePath}`;

      setPreviewUrl(publicUrl);
      setFileList([
        {
          uid: "-1",
          name: imagePath.split("/").pop() || "image",
          status: "done",
          url: publicUrl,
        },
      ]);
    } else {
      setPreviewUrl(null);
      setFileList([]);
    }
  }, [value, bucket]);

  const handleUpload: UploadProps["customRequest"] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);

    try {
      if (!file) {
        throw new Error("No file provided");
      }

      // Build the storage path: <ORG_ID>/<CONTENT_ID>/<filename>
      let pathParts: string[] = [];

      if (!organizationId) {
        throw new Error("Organization ID is required for image uploads");
      }

      if (storageOptions?.includeOrganizationIdInPath) {
        pathParts.push(organizationId);
      }

      if (storageOptions?.includeRecordIdInPath) {
        if (recordId) {
          pathParts.push(recordId);
        } else {
          // For create mode, use a content folder - file will need to be moved after record creation
          pathParts.push("content");
        }
      }

      const fileName = (file as File).name;
      const timestamp = Date.now();
      const sanitizedFileName = `${timestamp}_${fileName.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      )}`;

      pathParts.push(sanitizedFileName);
      const filePath = pathParts.join("/");

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } =
        await supabaseClient.storage.from(bucket).upload(filePath, file, {
          cacheControl: storageOptions?.cacheControlSeconds
            ? `max-age=${storageOptions.cacheControlSeconds}`
            : undefined,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      if (!uploadData?.path) {
        throw new Error("Upload failed: no path returned");
      }

      // Call onChange with the path (relative to bucket)
      onChange?.(filePath);

      onSuccess?.(uploadData, file as any);

      // Update preview
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
      setPreviewUrl(publicUrl);

      setFileList([
        {
          uid: "-1",
          name: fileName,
          status: "done",
          url: publicUrl,
        },
      ]);

      message.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      message.error(`Upload failed: ${(error as Error).message}`);
      onError?.(error as any);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      // Extract path from value
      let imagePath = value;
      if (value.includes("storage/v1/object/public/organization_assets/")) {
        const parts = value.split(
          "storage/v1/object/public/organization_assets/"
        );
        imagePath = parts[1] || value;
      } else if (value.startsWith("/storage/v1/object/public/")) {
        const parts = value.split(
          "/storage/v1/object/public/organization_assets/"
        );
        imagePath = parts[1] || value;
      }

      // Delete from storage
      const { error: deleteError } = await supabaseClient.storage
        .from(bucket)
        .remove([imagePath]);

      if (deleteError) {
        console.error("Delete error:", deleteError);
        message.warning(
          "Failed to delete file from storage, but continuing..."
        );
      }

      // Clear form value
      onChange?.(null);
      setPreviewUrl(null);
      setFileList([]);
      message.success("Image removed");
    } catch (error) {
      console.error("Remove error:", error);
      message.error(`Failed to remove image: ${(error as Error).message}`);
    }
  };

  const uploadProps: UploadProps = {
    customRequest: handleUpload,
    fileList,
    onRemove: handleRemove,
    maxCount: 1,
    accept: accept.join(","),
    disabled: disabled || uploading,
    beforeUpload: (file) => {
      const isValidSize = file.size / 1024 / 1024 < maxSizeMB;
      if (!isValidSize) {
        message.error(`Image must be smaller than ${maxSizeMB}MB!`);
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    showUploadList: {
      showPreviewIcon: false,
      showRemoveIcon: !disabled && !uploading,
    },
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="middle">
      <Upload {...uploadProps}>
        <Button
          icon={<UploadOutlined />}
          disabled={disabled || uploading}
          loading={uploading}
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </Button>
      </Upload>
      {previewUrl && (
        <div style={{ position: "relative", display: "inline-block" }}>
          <Image
            src={previewUrl}
            alt="Preview"
            style={{
              maxWidth: "100%",
              maxHeight: "400px",
              borderRadius: "4px",
            }}
            preview={true}
          />
          {!disabled && !uploading && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={handleRemove}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "rgba(255, 255, 255, 0.9)",
              }}
            >
              Remove
            </Button>
          )}
        </div>
      )}
    </Space>
  );
};
