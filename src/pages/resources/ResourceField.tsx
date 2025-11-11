import { useSelect } from "@refinedev/antd";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  App,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Tabs,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import type { UploadRequestOption } from "rc-upload/lib/interface";
import { InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";
import type { FieldDefinition } from "../../config/resourceDefinitions";
import { supabaseClient } from "../../utility";
import type { FormInstance } from "antd/es/form";

type Mode = "create" | "edit";

type ResourceFieldProps = {
  field: FieldDefinition;
  mode: Mode;
  lockedValue?: unknown;
};

type StorageImageInputProps = {
  field: FieldDefinition;
  value?: string | null;
  onChange?: (value: string | null) => void;
  disabled: boolean;
  mode: Mode;
  form: FormInstance;
};

const BYTES_PER_MB = 1024 * 1024;

const getFileExtension = (fileName: string): string => {
  const normalized = fileName.toLowerCase();
  const lastDotIndex = normalized.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return "";
  }

  return normalized.slice(lastDotIndex + 1);
};

const sanitizeFileName = (fileName: string): string => {
  const extension = getFileExtension(fileName);
  const nameWithoutExtension =
    extension.length > 0
      ? fileName.slice(0, fileName.toLowerCase().lastIndexOf(".")) // original casing for slicing
      : fileName;

  const normalizedBase = nameWithoutExtension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  const safeBase = normalizedBase.length > 0 ? normalizedBase : "image";

  return extension.length > 0 ? `${safeBase}.${extension}` : safeBase;
};

const buildStoragePath = (file: RcFile, folder?: string): string => {
  const uniqueSuffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  const sanitized = sanitizeFileName(file.name);
  const lastDotIndex = sanitized.lastIndexOf(".");
  const baseName =
    lastDotIndex === -1 ? sanitized : sanitized.slice(0, lastDotIndex);
  const extension = lastDotIndex === -1 ? "" : sanitized.slice(lastDotIndex);
  const fileName = `${baseName}-${uniqueSuffix}${extension}`;
  const trimmedFolder = folder
    ? folder.trim().replace(/^\/+/, "").replace(/\/+$/, "")
    : undefined;

  return trimmedFolder ? `${trimmedFolder}/${fileName}` : fileName;
};

const normalizePathSegment = (value: unknown, fallback: string): string => {
  const raw =
    typeof value === "string" || typeof value === "number"
      ? String(value)
      : "";
  const normalized = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.length > 0 ? normalized : fallback;
};

const resolvePublicUrl = (bucket: string, path: string): string | undefined => {
  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl;
};

const StorageImageInput: React.FC<StorageImageInputProps> = ({
  field,
  value,
  onChange,
  disabled,
  mode,
  form,
}) => {
  const { notification } = App.useApp();
  const storage = field.storage;
  const storePublicUrl = storage?.storePublicUrl ?? false;
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const tempRecordIdRef = useRef<string | undefined>(undefined);

  const ensureTempRecordSegment = useCallback(() => {
    if (!tempRecordIdRef.current) {
      tempRecordIdRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? `draft-${crypto.randomUUID()}`
          : `draft-${Date.now().toString(16)}`;
    }
    return tempRecordIdRef.current;
  }, []);

  const getBucket = useCallback(() => {
    if (!storage) {
      throw new Error("Storage configuration missing");
    }
    if (!storage.bucket) {
      throw new Error("Storage bucket is not configured.");
    }
    if (!storage.bucketField || !form) {
      return storage.bucket;
    }
    const rawBucket = form.getFieldValue(storage.bucketField);
    return typeof rawBucket === "string" && rawBucket.trim().length > 0
      ? rawBucket.trim()
      : storage.bucket;
  }, [form, storage]);

  useEffect(() => {
    if (!storage || !form || !storage.bucketField) {
      return;
    }
    const rawBucket = form.getFieldValue(storage.bucketField);
    if (
      (!rawBucket || String(rawBucket).trim().length === 0) &&
      storage.bucket
    ) {
      form.setFieldValue(storage.bucketField, storage.bucket);
    }
  }, [form, storage]);

  useEffect(() => {
    if (!storage) {
      setFileList([]);
      return;
    }

    if (typeof value === "string" && value.trim().length > 0) {
      const bucketName = getBucket();
      const storedValue = value.trim();
      const url = storePublicUrl
        ? storedValue
        : resolvePublicUrl(bucketName, storedValue);
      const name = storedValue.split("/").pop() ?? "image";
      setFileList([
        {
          uid: storedValue,
          name,
          status: "done",
          url: url ?? undefined,
          thumbUrl: url ?? undefined,
          response: {
            path: storedValue,
            bucket: bucketName,
            publicUrl: url ?? undefined,
          },
        },
      ]);
    } else {
      setFileList([]);
    }
  }, [getBucket, storage, storePublicUrl, value]);

  const removeFromStorage = useCallback(
    async (path?: string | null, bucketOverride?: string | null) => {
      if (!storage || storePublicUrl || !path) {
        return;
      }
      const bucketName = bucketOverride ?? getBucket();
      const { error } = await supabaseClient.storage
        .from(bucketName)
        .remove([path]);
      if (error) {
        notification.error({
          message: "Unable to delete image",
          description: error.message,
        });
      }
    },
    [getBucket, notification, storage, storePublicUrl]
  );

  const handleRemove = useCallback(
    async (file: UploadFile) => {
      if (disabled) {
        return false;
      }

      if (!storage) {
        onChange?.(null);
        setFileList([]);
        return true;
      }

      const currentBucket =
        storage.bucketField && form
          ? form.getFieldValue(storage.bucketField)
          : storage.bucket;
      const normalizedBucket =
        typeof currentBucket === "string" && currentBucket.trim().length > 0
          ? currentBucket.trim()
          : storage.bucket;

      const referencedPath =
        (typeof value === "string" && value.trim().length > 0
          ? value.trim()
          : undefined) ||
        (typeof file.uid === "string" ? file.uid : undefined) ||
        (typeof file.response === "object" &&
        file.response &&
        "path" in file.response
          ? String((file.response as Record<string, any>).path ?? "")
          : undefined);

      await removeFromStorage(referencedPath ?? null, normalizedBucket ?? null);

      setFileList([]);
      onChange?.(null);
      return true;
    },
    [disabled, form, onChange, removeFromStorage, storage, value]
  );

  const handlePreview = useCallback((file: UploadFile) => {
    const url =
      file.url ??
      (typeof file.response === "object" &&
      file.response &&
      "publicUrl" in file.response
        ? (file.response as { publicUrl?: string }).publicUrl
        : undefined);

    if (url && typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, []);

  const handleUpload = useCallback(
    async (options: UploadRequestOption) => {
      if (disabled) {
        options.onError?.(new Error("Uploading is disabled"));
        return;
      }

      if (!storage) {
        options.onError?.(new Error("Storage configuration missing"));
        return;
      }

      const rcFile = options.file as RcFile;
      const maxFileSize = storage.maxSizeMB
        ? storage.maxSizeMB * BYTES_PER_MB
        : undefined;

      if (maxFileSize && rcFile.size > maxFileSize) {
        const message = `Image must be ${storage.maxSizeMB}MB or smaller`;
        notification.error({
          message: "Image too large",
          description: message,
        });
        options.onError?.(new Error(message));
        return;
      }

      const acceptedTypes = storage.accept ?? [];
      if (acceptedTypes.length > 0) {
        const extension = getFileExtension(rcFile.name);
        const normalizedAccept = acceptedTypes.map((item) => item.toLowerCase());
        const matchesMime =
          rcFile.type.length > 0 &&
          normalizedAccept.includes(rcFile.type.toLowerCase());
        const matchesExtension = normalizedAccept.some((item) => {
          if (!item.startsWith(".")) {
            return false;
          }
          return item.slice(1) === extension;
        });

        if (!matchesMime && !matchesExtension) {
          const message = `Only ${acceptedTypes.join(", ")} files are allowed`;
          notification.error({
            message: "Unsupported file type",
            description: message,
          });
          options.onError?.(new Error(message));
          return;
        }
      }

      const bucketName = getBucket();
      const organizationValue =
        storage.organizationField && form
          ? form.getFieldValue(storage.organizationField)
          : undefined;
      const recordValue =
        storage.recordIdField && form
          ? form.getFieldValue(storage.recordIdField)
          : undefined;

      const folderSegments: string[] = [];

      if (storage.folder) {
        const cleaned = storage.folder
          .split("/")
          .map((segment) => segment.trim())
          .filter((segment) => segment.length > 0)
          .join("/");
        if (cleaned.length > 0) {
          folderSegments.push(cleaned);
        }
      }

      if (storage.includeOrganizationIdInPath) {
        folderSegments.push(
          normalizePathSegment(
            organizationValue,
            mode === "edit" ? "org-unknown" : "org-pending"
          )
        );
      }

      if (storage.includeRecordIdInPath) {
        const normalizedRecord = normalizePathSegment(
          recordValue,
          mode === "edit" ? "record-unknown" : ""
        );
        if (normalizedRecord.length > 0) {
          folderSegments.push(normalizedRecord);
        } else {
          folderSegments.push(ensureTempRecordSegment());
        }
      }

      const folder =
        folderSegments.length > 0
          ? folderSegments
              .map((segment) => segment.replace(/^\/+|\/+$/g, ""))
              .filter((segment) => segment.length > 0)
              .join("/")
          : undefined;

      const path = buildStoragePath(rcFile, folder);
      setUploading(true);
      setFileList([
        {
          uid: path,
          name: rcFile.name,
          status: "uploading",
        },
      ]);

      const { error } = await supabaseClient.storage
        .from(bucketName)
        .upload(path, rcFile, {
          cacheControl: storage.cacheControlSeconds ?? "3600",
          contentType: rcFile.type || undefined,
          upsert: false,
        });

      if (error) {
        notification.error({
          message: "Image upload failed",
          description: error.message,
        });
        setUploading(false);
        setFileList([]);
        options.onError?.(error as Error);
        return;
      }

      if (!storePublicUrl) {
        const previousPath =
          typeof value === "string" && value.trim().length > 0
            ? value.trim()
            : undefined;
        if (previousPath) {
          const previousBucket =
            storage.bucketField && form
              ? form.getFieldValue(storage.bucketField)
              : bucketName;
          await removeFromStorage(previousPath, previousBucket ?? bucketName);
        }
      }

      const publicUrl = resolvePublicUrl(bucketName, path);
      const storedValue = storePublicUrl
        ? publicUrl ?? path
        : path;

      const uploadedFile: UploadFile = {
        uid: path,
        name: rcFile.name,
        status: "done",
        url: publicUrl ?? undefined,
        thumbUrl: publicUrl ?? undefined,
        response: {
          path,
          bucket: bucketName,
          publicUrl: publicUrl ?? undefined,
        },
      };

      setFileList([uploadedFile]);
      setUploading(false);

      if (storage.bucketField && form) {
        form.setFieldValue(storage.bucketField, bucketName);
      }

      onChange?.(storedValue);
      options.onSuccess?.({ path, bucket: bucketName }, rcFile);
    },
    [
      disabled,
      ensureTempRecordSegment,
      form,
      getBucket,
      mode,
      notification,
      onChange,
      removeFromStorage,
      storage,
      storePublicUrl,
      value,
    ]
  );

  if (!storage) {
    return (
      <Typography.Text type="warning">
        Storage options are not configured for this field.
      </Typography.Text>
    );
  }

  const accepts = storage.accept?.join(",") ?? undefined;
  const showUploadButton = !disabled && fileList.length === 0;

  return (
    <Upload
      accept={accepts}
      customRequest={handleUpload}
      fileList={fileList}
      listType="picture-card"
      maxCount={1}
      onPreview={handlePreview}
      onRemove={handleRemove}
      showUploadList={{
        showPreviewIcon: true,
        showRemoveIcon: !disabled,
      }}
      disabled={disabled || uploading}
    >
      {showUploadButton ? (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>Upload</div>
        </div>
      ) : null}
    </Upload>
  );
};

const getFieldPlaceholder = (field: FieldDefinition) => {
  if (field.placeholder) {
    return field.placeholder;
  }

  if (typeof field.helperText === "string" && field.helperText.trim().length) {
    return field.helperText;
  }

  if (typeof field.defaultValue === "string" && field.defaultValue.trim().length) {
    return field.defaultValue;
  }

  const normalizedLabel = field.label.toLowerCase();

  switch (field.type) {
    case "json":
      return 'Enter JSON, e.g. {"key": "value"}';
    case "textarea":
    case "text":
      return `Enter ${normalizedLabel}`;
    case "number":
      return `Enter ${normalizedLabel}`;
    case "datetime":
      return `Select ${normalizedLabel}`;
    case "select":
      return `Select ${normalizedLabel}`;
    default:
      return undefined;
  }
};

export const ResourceField: React.FC<ResourceFieldProps> = ({
  field,
  mode,
  lockedValue,
}) => {
  const formInstance = Form.useFormInstance();
  const isLocked = lockedValue !== undefined;
  const isDisabled =
    isLocked ||
    (mode === "create" && !!field.disabledOnCreate) ||
    (mode === "edit" && !!field.disabledOnEdit);

  const rules = field.required
    ? [
        {
          required: true,
          message: `${field.label} is required`,
        },
      ]
    : undefined;

  const placeholder = getFieldPlaceholder(field);

  if (field.type === "boolean") {
    return (
      <Form.Item
        key={field.key}
        name={field.key}
        label={field.label}
        valuePropName="checked"
        rules={rules}
        tooltip={field.helperText}
      >
        <Switch disabled={isDisabled} />
      </Form.Item>
    );
  }

  if (field.type === "number") {
    return (
      <Form.Item
        key={field.key}
        name={field.key}
        label={field.label}
        rules={rules}
        tooltip={field.helperText}
      >
        <InputNumber
          style={{ width: "100%" }}
          disabled={isDisabled}
          min={field.min}
          max={field.max}
          step={field.step}
          placeholder={placeholder}
        />
      </Form.Item>
    );
  }

  if (field.type === "datetime") {
    return (
      <Form.Item
        key={field.key}
        name={field.key}
        label={field.label}
        rules={rules}
        tooltip={field.helperText}
      >
        <DatePicker
          showTime
          style={{ width: "100%" }}
          disabled={isDisabled}
          placeholder={placeholder}
        />
      </Form.Item>
    );
  }

  if (field.type === "select") {
    if (field.relation) {
      const { selectProps } = useSelect({
        resource: field.relation.resource,
        optionLabel: field.relation.optionLabel as any,
        optionValue: (field.relation.optionValue ?? "id") as any,
        meta: field.relation.meta,
        defaultValue: lockedValue as any,
      });

      return (
        <Form.Item
          key={field.key}
          name={field.key}
          label={field.label}
          rules={rules}
          tooltip={field.helperText}
        >
          <Select
            {...selectProps}
            disabled={isDisabled}
            allowClear={!field.required && !isLocked}
            showSearch={!isLocked}
            placeholder={selectProps.placeholder ?? placeholder}
          />
        </Form.Item>
      );
    }

    return (
      <Form.Item
        key={field.key}
        name={field.key}
        label={field.label}
        rules={rules}
        tooltip={field.helperText}
      >
        <Select
          disabled={isDisabled}
          allowClear={!field.required && !isLocked}
          options={field.enumValues}
          placeholder={placeholder}
        />
      </Form.Item>
    );
  }

  if (field.type === "image") {
    return (
      <Form.Item
        key={field.key}
        name={field.key}
        label={field.label}
        rules={rules}
        tooltip={field.helperText}
        valuePropName="value"
      >
        <StorageImageInput
          field={field}
          disabled={isDisabled}
          mode={mode}
          form={formInstance}
        />
      </Form.Item>
    );
  }

  const isTextArea = field.type === "textarea" || field.type === "json";

  if (field.type === "themeColors") {
    const colorFields = [
      { key: "main", label: "Main" },
      { key: "primary", label: "Primary" },
      { key: "secondary", label: "Secondary" },
    ];

    return (
      <Form.Item
        key={field.key}
        label={field.label}
        colon={true}
        style={{ marginBottom: 0 }}
      >
        <Tabs
          size="small"
          items={[
            {
              key: "theme-colors",
              label: (
                <Space size={4}>
                  Colors
                  <Tooltip title="Customize the primary, secondary, and main colors used across this organization.">
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              ),
              children: (
                <Space size={16} style={{ width: "100%" }} align="center" wrap>
                  {colorFields.map((colorField) => (
                    <Space key={colorField.key} direction="horizontal" size={8}>
                      <span style={{ minWidth: 70 }}>{colorField.label}</span>
                      <Form.Item
                        name={[field.key, "theme", "colors", colorField.key]}
                        rules={[
                          {
                            required: true,
                            message: `${colorField.label} color is required`,
                          },
                        ]}
                        colon={false}
                        style={{ marginBottom: 0 }}
                      >
                        <Input
                          type="color"
                          disabled={isDisabled}
                          style={{
                            width: 28,
                            height: 28,
                            padding: 0,
                            borderRadius: 4,
                            border: "1px solid #d9d9d9",
                            background: "transparent",
                          }}
                        />
                      </Form.Item>
                    </Space>
                  ))}
                </Space>
              ),
            },
          ]}
        />
      </Form.Item>
    );
  }

  return (
    <Form.Item
      key={field.key}
      name={field.key}
      label={field.label}
      rules={rules}
      tooltip={field.helperText}
    >
      {isTextArea ? (
        <Input.TextArea
          rows={field.type === "json" ? 8 : 4}
          disabled={isDisabled}
          placeholder={placeholder}
        />
      ) : (
        <Input disabled={isDisabled} placeholder={placeholder} />
      )}
    </Form.Item>
  );
};


