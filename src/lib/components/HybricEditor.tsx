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
import markdownItTaskLists from "markdown-it-task-lists";
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
  .use(markdownItTaskLists, { enabled: true })
  .use(markdownItFootnote)
  .use(markdownItMark)
  .use(markdownItSub)
  .use(markdownItSup);

const normalizeLineBreaks = (value: string): string => value.replace(/\r\n/g, "\n");

const normalizeTaskListHtml = (html: string): string => {
  if (typeof DOMParser === "undefined") {
    return html;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const taskItems = Array.from(doc.querySelectorAll("li.task-list-item"));

  taskItems.forEach((item) => {
    const checkbox = item.querySelector("input.task-list-item-checkbox") as HTMLInputElement | null;
    if (!checkbox) {
      return;
    }

    const checked = checkbox.checked || checkbox.hasAttribute("checked");
    const childNodes = Array.from(item.childNodes).filter((node) => {
      return !(node instanceof HTMLInputElement && node.classList.contains("task-list-item-checkbox"));
    });

    item.replaceChildren();
    item.setAttribute("data-type", "taskItem");
    item.setAttribute("data-checked", checked ? "true" : "false");
    item.classList.remove("task-list-item");

    const label = doc.createElement("label");
    label.setAttribute("contenteditable", "false");

    const input = doc.createElement("input");
    input.type = "checkbox";
    if (checked) {
      input.setAttribute("checked", "checked");
    }

    const marker = doc.createElement("span");
    label.append(input, marker);

    const content = doc.createElement("div");
    const inlineContainer = doc.createElement("p");
    const blockTags = new Set(["UL", "OL", "P", "DIV", "PRE", "BLOCKQUOTE", "TABLE"]);

    childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent ?? "";
        if (text.trim().length > 0) {
          inlineContainer.appendChild(doc.createTextNode(text));
        }
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
      }

      const element = node as HTMLElement;
      if (element.tagName === "LABEL") {
        const text = element.textContent?.trim() ?? "";
        if (text.length > 0) {
          inlineContainer.appendChild(doc.createTextNode(text));
        }
        return;
      }

      if (blockTags.has(element.tagName)) {
        const nestedCheckboxes = Array.from(
          element.querySelectorAll("input.task-list-item-checkbox"),
        );
        nestedCheckboxes.forEach((input) => input.remove());

        if (
          element.tagName === "P" &&
          (element.textContent ?? "").trim().length === 0 &&
          element.children.length === 0
        ) {
          return;
        }

        if ((inlineContainer.textContent ?? "").trim().length > 0 || inlineContainer.childNodes.length > 0) {
          content.appendChild(inlineContainer.cloneNode(true));
          inlineContainer.replaceChildren();
        }
        content.appendChild(element);
        return;
      }

      inlineContainer.appendChild(element);
    });

    if ((inlineContainer.textContent ?? "").trim().length > 0 || inlineContainer.childNodes.length > 0) {
      content.appendChild(inlineContainer);
    } else if (!content.firstChild) {
      content.appendChild(doc.createElement("p"));
    }

    item.append(label, content);
  });

  const unorderedLists = Array.from(doc.querySelectorAll("ul"));
  unorderedLists.forEach((list) => {
    const directItems = Array.from(list.children).filter(
      (child): child is HTMLLIElement => child instanceof HTMLLIElement,
    );
    if (directItems.length === 0) {
      return;
    }

    const segments: Array<{
      type: "task" | "normal";
      items: HTMLLIElement[];
    }> = [];

    let currentType: "task" | "normal" | null = null;
    let bucket: HTMLLIElement[] = [];

    directItems.forEach((item) => {
      const nextType =
        item.getAttribute("data-type") === "taskItem" ? "task" : "normal";

      if (currentType === null) {
        currentType = nextType;
      }

      if (nextType !== currentType) {
        segments.push({ type: currentType, items: bucket });
        bucket = [item];
        currentType = nextType;
        return;
      }

      bucket.push(item);
    });

    if (currentType && bucket.length > 0) {
      segments.push({ type: currentType, items: bucket });
    }

    if (segments.length === 1) {
      if (segments[0].type === "task") {
        list.setAttribute("data-type", "taskList");
      }
      list.classList.remove("contains-task-list");
      return;
    }

    const parent = list.parentElement;
    if (!parent) {
      return;
    }

    segments.forEach((segment) => {
      const nextList = doc.createElement("ul");
      if (segment.type === "task") {
        nextList.setAttribute("data-type", "taskList");
      }

      segment.items.forEach((item) => {
        nextList.appendChild(item);
      });

      parent.insertBefore(nextList, list);
    });

    list.remove();
  });

  const taskLists = Array.from(doc.querySelectorAll("ul[data-type='taskList']"));
  taskLists.forEach((list) => {
    if (!list.querySelector("li[data-type='taskItem']")) {
      list.removeAttribute("data-type");
    }
    list.classList.remove("contains-task-list");
  });

  return doc.body.innerHTML;
};

const convertMarkdownToHtml = (markdown: string): string =>
  normalizeTaskListHtml(markdownParser.render(normalizeLineBreaks(markdown)));

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
      handleClick: (_view, _pos, event) => {
        const mouseEvent = event as MouseEvent;
        const target = mouseEvent.target as HTMLElement | null;
        const anchor = target?.closest("a");
        const href = anchor?.getAttribute("href");

        if (!href) {
          return false;
        }

        mouseEvent.preventDefault();

        if (href.startsWith("#")) {
          const id = href.slice(1);
          const destination = document.getElementById(id);
          if (destination) {
            destination.scrollIntoView({ behavior: "smooth", block: "start" });
            return true;
          }

          return false;
        }

        window.open(href, "_blank", "noopener,noreferrer");
        return true;
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
