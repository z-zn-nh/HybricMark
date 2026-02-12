import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import Mathematics, { migrateMathStrings } from "@tiptap/extension-mathematics";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { TableKit } from "@tiptap/extension-table";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import UniqueID from "@tiptap/extension-unique-id";
import StarterKit from "@tiptap/starter-kit";
import { Extension } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";
import { EditorContent, useEditor } from "@tiptap/react";
import MarkdownIt from "markdown-it";
import markdownItFootnote from "markdown-it-footnote";
import markdownItMark from "markdown-it-mark";
import markdownItSub from "markdown-it-sub";
import markdownItSup from "markdown-it-sup";
import { useEffect, useMemo, useRef } from "react";
import { twMerge } from "tailwind-merge";
import type { Content, Editor } from "@tiptap/core";

import {
  EditorContextMenu,
  type ExtractCardData,
} from "./EditorContextMenu";
import { HtmlBlock } from "../extensions/HtmlBlock";

const UNIQUE_ID_NODE_TYPES = [
  "heading",
  "paragraph",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "codeBlock",
] as const;

const markdownParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
})
  .use(markdownItFootnote)
  .use(markdownItMark)
  .use(markdownItSub)
  .use(markdownItSup);

const normalizeLineBreaks = (value: string): string => value.replace(/\r\n/g, "\n");

const convertMarkdownToHtml = (markdown: string): string =>
  markdownParser.render(normalizeLineBreaks(markdown));

const createUuid = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

const KeyboardBehavior = Extension.create({
  name: "keyboardBehavior",
  addKeyboardShortcuts() {
    return {
      "Mod-Enter": () => {
        const { state, view } = this.editor;
        const { $from } = state.selection;

        if ($from.parent.type.name !== "codeBlock") {
          return false;
        }

        const paragraphNode = state.schema.nodes.paragraph?.create();
        if (!paragraphNode) {
          return false;
        }

        const insertPos = $from.after();
        let tr = state.tr.insert(insertPos, paragraphNode);
        tr = tr.setSelection(TextSelection.create(tr.doc, insertPos + 1));
        view.dispatch(tr.scrollIntoView());
        return true;
      },
      Enter: () => {
        const { state } = this.editor;
        const { selection } = state;

        if (!selection.empty || state.selection.$from.parent.type.name === "codeBlock") {
          return false;
        }

        if (!this.editor.isActive("code")) {
          return false;
        }

        return this.editor.chain().focus().splitBlock().unsetCode().run();
      },
    };
  },
});

export interface HybricEditorProps {
  content?: Content;
  onChange?: (editor: Editor) => void;
  onExtract?: (data: ExtractCardData) => void;
  editable?: boolean;
  className?: string;
}

export const HybricEditor = ({
  content,
  onChange,
  onExtract,
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
      HtmlBlock,
      Typography,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      Image.configure({ inline: false, allowBase64: true }),
      TableKit.configure({
        table: { resizable: false },
      }),
      Mathematics.configure({
        katexOptions: {
          throwOnError: false,
        },
      }),
      UniqueID.configure({
        types: [...UNIQUE_ID_NODE_TYPES],
        generateID: () => createUuid(),
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands...",
      }),
      KeyboardBehavior,
    ],
    [],
  );

  const resolvedContent: Content | undefined =
    typeof content !== "string"
      ? content
      : (() => {
          const source = content.trim();
          if (!source) {
            return "<p></p>";
          }
          if (source.startsWith("<")) {
            return content;
          }
          return convertMarkdownToHtml(content);
        })();

  const editor = useEditor({
    extensions,
    content: resolvedContent,
    editable,
    immediatelyRender: false,
    onCreate: ({ editor: currentEditor }) => {
      migrateMathStrings(currentEditor);
    },
    editorProps: {
      attributes: {
        class: "hm-editor-content",
      },
      handleClick: (view, _pos, event) => {
        const mouseEvent = event as MouseEvent;
        const target = mouseEvent.target as HTMLElement | null;
        const anchor = target?.closest("a");
        const href = anchor?.getAttribute("href");

        if (!href) {
          return false;
        }

        if (mouseEvent.metaKey || mouseEvent.ctrlKey || !view.editable) {
          window.open(href, "_blank", "noopener,noreferrer");
          return true;
        }

        return false;
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

    const handleUpdate = () => {
      console.log("[HybricEditor] doc:", editor.getJSON());
      onChangeRef.current?.(editor);
    };

    handleUpdate();
    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor]);

  return (
    <div className={twMerge("hm-editor-root", className)}>
      <EditorContextMenu editor={editor} onExtract={onExtract}>
        <EditorContent editor={editor} />
      </EditorContextMenu>
    </div>
  );
};
