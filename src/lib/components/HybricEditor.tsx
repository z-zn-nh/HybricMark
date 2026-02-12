import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import UniqueID from "@tiptap/extension-unique-id";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useMemo, useRef } from "react";
import { twMerge } from "tailwind-merge";
import type { Content, JSONContent } from "@tiptap/core";

import { HybridLink } from "../extensions/HybridLink";

const UNIQUE_ID_NODE_TYPES = [
  "paragraph",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "codeBlock",
] as const;

const createUuidV4 = (): string =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });

export interface HybricEditorProps {
  content?: Content;
  onChange?: (content: JSONContent) => void;
  editable?: boolean;
  className?: string;
}

export const HybricEditor = ({
  content,
  onChange,
  editable = true,
  className,
}: HybricEditorProps) => {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        link: false,
      }),
      Typography,
      HybridLink,
      Placeholder.configure({
        placeholder: "Type '/' for commands...",
      }),
      UniqueID.configure({
        types: [...UNIQUE_ID_NODE_TYPES],
        generateID: () => createUuidV4(),
      }),
    ],
    [],
  );

  const editor = useEditor({
    extensions,
    content,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "hm-editor-content hm-prose hm-max-w-none hm-w-full hm-leading-7 focus:hm-outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleContentChange = () => {
      const json = editor.getJSON();
      console.log("[HybricEditor] content changed", json);
      onChangeRef.current?.(json);
    };

    handleContentChange();
    editor.on("update", handleContentChange);

    return () => {
      editor.off("update", handleContentChange);
    };
  }, [editor]);

  return (
    <div className={twMerge("hm-editor-root hm-w-full", className)}>
      <EditorContent editor={editor} />
    </div>
  );
};
