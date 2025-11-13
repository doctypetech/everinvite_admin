import {
  useCallback,
  useContext,
  useMemo,
  type CSSProperties,
  type FC,
} from "react";
import { theme } from "antd";
import { Editor } from "@tinymce/tinymce-react";
import tinymce from "tinymce/tinymce";

import "tinymce/icons/default";
import "tinymce/themes/silver";
import "tinymce/plugins/advlist";
import "tinymce/plugins/anchor";
import "tinymce/plugins/autolink";
import "tinymce/plugins/charmap";
import "tinymce/plugins/code";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/preview";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/table";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/wordcount";
import "tinymce/models/dom/model";
import "tinymce/skins/ui/oxide/skin.min.css";
import "tinymce/skins/ui/oxide/content.min.css";
import "tinymce/skins/ui/oxide-dark/skin.min.css";
import "tinymce/skins/content/default/content.min.css";
import "tinymce/skins/content/dark/content.min.css";

import "./RichTextEditor.css";
import { ColorModeContext } from "../contexts/color-mode";

type RichTextEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
};

const plugins = [
  "advlist",
  "anchor",
  "autolink",
  "charmap",
  "code",
  "fullscreen",
  "insertdatetime",
  "link",
  "lists",
  "preview",
  "searchreplace",
  "table",
  "visualblocks",
  "wordcount",
];

const toolbar =
  "undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link table | removeformat | code";

export const RichTextEditor: FC<RichTextEditorProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const { token } = theme.useToken();
  const { mode } = useContext(ColorModeContext);
  const isDarkMode = mode === "dark";

  const handleEditorChange = useCallback(
    (content: string) => {
      onChange?.(content);
    },
    [onChange],
  );

  const wrapperStyle = useMemo<CSSProperties>(
    () =>
      ({
        "--rich-text-editor-border": token.colorBorder,
        "--rich-text-editor-toolbar-bg": token.colorBgElevated,
        "--rich-text-editor-bg": token.colorBgContainer,
      }) as CSSProperties,
    [token.colorBgContainer, token.colorBgElevated, token.colorBorder],
  );

  const contentStyle = useMemo(
    () =>
      [
        "body {",
        `  background: ${token.colorBgContainer};`,
        `  color: ${token.colorText};`,
        "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;",
        "  font-size: 14px;",
        "  line-height: 1.5;",
        "}",
        `a { color: ${token.colorLink}; }`,
        `::selection { background: ${token.colorPrimaryBg}; color: ${token.colorPrimaryText}; }`,
      ].join("\n"),
    [
      token.colorBgContainer,
      token.colorLink,
      token.colorPrimaryBg,
      token.colorPrimaryText,
      token.colorText,
    ],
  );

  return (
    <div className="rich-text-editor-root" style={wrapperStyle}>
      <Editor
        tinymce={tinymce}
        value={value ?? ""}
        onEditorChange={handleEditorChange}
        disabled={disabled}
        init={{
          height: 320,
          menubar: false,
          branding: false,
          skin: isDarkMode ? "oxide-dark" : "oxide",
          content_css: isDarkMode ? "dark" : "default",
          plugins,
          toolbar,
          toolbar_mode: "sliding",
          license_key: "gpl",
          content_style: contentStyle,
        }}
      />
    </div>
  );
};
