declare module "@tinymce/tinymce-react" {
  import type { ComponentType } from "react";

  export type EditorEventHandler<TArgs extends any[] = any[]> = (
    ...args: TArgs
  ) => void;

  export interface EditorProps {
    value?: string;
    initialValue?: string;
    onEditorChange?: (content: string, editor: any) => void;
    onInit?: (event: unknown, editor: any) => void;
    disabled?: boolean;
    init?: Record<string, unknown>;
    id?: string;
    inline?: boolean;
    tagName?: string;
    textareaName?: string;
    plugins?: string | string[];
    toolbar?: string | string[];
    tinymce?: any;
    tinymceScriptSrc?: string;
    cloudChannel?: string;
    outputFormat?: "html" | "text";
    licenseKey?: string;
    className?: string;
    scriptLoading?: {
      async?: boolean;
      defer?: boolean;
      delay?: number;
    };
    [key: string]: unknown;
  }

  export const Editor: ComponentType<EditorProps>;
}

declare module "tinymce/tinymce";
declare module "tinymce/icons/*";
declare module "tinymce/themes/*";
declare module "tinymce/plugins/*";
declare module "tinymce/skins/*";

