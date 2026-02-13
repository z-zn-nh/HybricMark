import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import Mathematics, { migrateMathStrings } from "@tiptap/extension-mathematics";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Underline from "@tiptap/extension-underline";
import UniqueID from "@tiptap/extension-unique-id";
import StarterKit from "@tiptap/starter-kit";
import { Extension } from "@tiptap/core";
import { Fragment, type Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { CellSelection, TableMap } from "@tiptap/pm/tables";
import { Decoration, DecorationSet, type EditorView } from "@tiptap/pm/view";
import { EditorContent, useEditor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Grid2x2,
} from "lucide-react";
import MarkdownIt from "markdown-it";
import markdownItFootnote from "markdown-it-footnote";
import markdownItMark from "markdown-it-mark";
import markdownItSub from "markdown-it-sub";
import markdownItSup from "markdown-it-sup";
import markdownItTaskLists from "markdown-it-task-lists";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const HEADING_HINT_ATTR = "data-hm-heading-hint";
const TABLE_TOOLTIP_OFFSET = 28;
const TABLE_TOOLTIP_MIN_TOP = 8;
const FORBIDDEN_HTML_TAGS = new Set([
  "script",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "base",
  "form",
]);
const URL_ATTRS = new Set(["href", "src", "xlink:href", "formaction"]);

const isSafeUrl = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  if (trimmed.startsWith("#")) {
    return true;
  }

  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return true;
    }
    if (parsed.protocol === "mailto:" || parsed.protocol === "tel:") {
      return true;
    }
    if (parsed.protocol === "data:") {
      return /^data:image\//i.test(trimmed);
    }
  } catch {
    return false;
  }

  return false;
};

const sanitizeHtml = (html: string): string => {
  if (typeof DOMParser === "undefined") {
    return html;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const nodes = Array.from(doc.body.querySelectorAll("*"));

  nodes.forEach((node) => {
    const tag = node.tagName.toLowerCase();
    if (FORBIDDEN_HTML_TAGS.has(tag)) {
      node.remove();
      return;
    }

    const attrs = Array.from(node.attributes);
    attrs.forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value;

      if (name.startsWith("on")) {
        node.removeAttribute(attr.name);
        return;
      }

      if (name === "style" || name === "srcdoc") {
        node.removeAttribute(attr.name);
        return;
      }

      if (URL_ATTRS.has(name) && !isSafeUrl(value)) {
        node.removeAttribute(attr.name);
      }
    });
  });

  return doc.body.innerHTML;
};

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
  sanitizeHtml(normalizeTaskListHtml(markdownParser.render(normalizeLineBreaks(markdown))));

const normalizeIncomingContent = (incoming?: Content): Content | undefined => {
  if (typeof incoming !== "string") {
    return incoming;
  }

  const source = incoming.trim();
  if (!source) {
    return "<p></p>";
  }

  if (source.startsWith("<")) {
    return sanitizeHtml(incoming);
  }

  return convertMarkdownToHtml(incoming);
};

const getContentSignature = (value: Content | undefined): string => {
  if (typeof value === "string") {
    return `s:${value}`;
  }

  try {
    return `j:${JSON.stringify(value ?? null)}`;
  } catch {
    return "j:[unserializable]";
  }
};

const BLOCK_MARKDOWN_PATTERNS = [
  /^\s{0,3}#{1,6}\s/m,
  /^\s*>\s/m,
  /^\s*(?:[-*+]|\d+\.)\s/m,
  /^\s*[-+*]\s\[(?: |x|X)\]\s/m,
  /^\s*```/m,
  /^\|.+\|$/m,
  /^\s*\[\^[^\]]+\]:\s+/m,
];

const INLINE_MARKDOWN_PATTERNS = [
  /(?:\*\*|__)[^*_]+(?:\*\*|__)/,
  /(?:\*|_)[^*_]+(?:\*|_)/,
  /~~[^~]+~~/,
  /==[^=]+==/,
  /`[^`\n]+`/,
  /!\[[^\]]*]\([^)]+\)/,
  /\[[^\]]+\]\([^)]+\)/,
  /\[\^[^\]]+\]/,
  /~[^~\n]+~/,
  /\^[^^\n]+\^/,
  /\$[^$\n]+\$/,
];

const shouldParsePastedMarkdown = (text: string): boolean => {
  const normalized = normalizeLineBreaks(text).trim();
  if (normalized.length < 3) {
    return false;
  }

  if (BLOCK_MARKDOWN_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return true;
  }

  if (normalized.includes("\n") && INLINE_MARKDOWN_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return true;
  }

  return false;
};

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

type TableAlign = "left" | "center" | "right";
const clampTableDimension = (value: number): number =>
  Math.max(1, Math.min(20, Number.isFinite(value) ? Math.floor(value) : 3));
const parseTableDimensionInput = (rawInput: string): number | null => {
  const normalized = rawInput.trim();
  if (!/^\d+$/.test(normalized)) {
    return null;
  }
  return clampTableDimension(Number(normalized));
};

interface TableTooltipState {
  visible: boolean;
  top: number;
  left: number;
  cellPos: number | null;
}

interface LinkHoverTooltipState {
  visible: boolean;
  href: string;
  top: number;
  left: number;
}

const isTableCellSelection = (selection: unknown): selection is CellSelection => {
  if (selection instanceof CellSelection) {
    return true;
  }

  if (!selection || typeof selection !== "object") {
    return false;
  }

  return "$anchorCell" in selection && "$headCell" in selection;
};

const exitListItemToParagraph = (editor: Editor): boolean => {
  const { state, view } = editor;
  const { selection } = state;
  if (!selection.empty) {
    return false;
  }

  const { $from } = selection;
  let itemDepth = -1;

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (node.type.name === "listItem" || node.type.name === "taskItem") {
      itemDepth = depth;
      break;
    }
  }

  if (itemDepth <= 0) {
    return false;
  }

  const listDepth = itemDepth - 1;
  if (listDepth <= 0) {
    return false;
  }

  const listNode = $from.node(listDepth);
  if (
    listNode.type.name !== "bulletList" &&
    listNode.type.name !== "orderedList" &&
    listNode.type.name !== "taskList"
  ) {
    return false;
  }

  const itemNode = $from.node(itemDepth);
  const paragraphNodeType = state.schema.nodes.paragraph;
  const firstTextblock = itemNode.firstChild;
  if (!paragraphNodeType || !firstTextblock || !firstTextblock.isTextblock) {
    return false;
  }

  const plainText = firstTextblock.textContent ?? "";
  const paragraphContent = plainText.length > 0 ? state.schema.text(plainText) : null;
  const paragraph = paragraphNodeType.create(null, paragraphContent);
  const itemIndex = $from.index(listDepth);

  const beforeItems: ProseMirrorNode[] = [];
  const afterItems: ProseMirrorNode[] = [];
  for (let index = 0; index < listNode.childCount; index += 1) {
    if (index < itemIndex) {
      beforeItems.push(listNode.child(index));
      continue;
    }
    if (index > itemIndex) {
      afterItems.push(listNode.child(index));
    }
  }

  const replacement: ProseMirrorNode[] = [];
  if (beforeItems.length > 0) {
    replacement.push(
      listNode.type.create(listNode.attrs, Fragment.fromArray(beforeItems)),
    );
  }
  replacement.push(paragraph);
  if (afterItems.length > 0) {
    replacement.push(
      listNode.type.create(listNode.attrs, Fragment.fromArray(afterItems)),
    );
  }

  const listPos = $from.before(listDepth);
  let tr = state.tr.replaceWith(
    listPos,
    listPos + listNode.nodeSize,
    Fragment.fromArray(replacement),
  );
  const beforeSize = beforeItems.length > 0 ? replacement[0].nodeSize : 0;
  const cursorPos = Math.max(
    1,
    Math.min(listPos + beforeSize + 1, tr.doc.content.size),
  );
  tr = tr.setSelection(TextSelection.near(tr.doc.resolve(cursorPos), 1));
  view.dispatch(tr.scrollIntoView());
  editor.commands.focus();
  return true;
};

const TyporaTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      textAlign: {
        default: "left",
        parseHTML: (element: HTMLElement) => {
          const raw = element.style.textAlign?.toLowerCase() ?? "left";
          if (raw === "center" || raw === "right") {
            return raw;
          }
          return "left";
        },
        renderHTML: (attributes: { textAlign?: string }) => {
          const textAlign =
            attributes.textAlign === "center" || attributes.textAlign === "right"
              ? attributes.textAlign
              : "left";

          if (textAlign === "left") {
            return {};
          }

          return {
            style: `text-align: ${textAlign};`,
          };
        },
      },
    };
  },
});

const TyporaTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      textAlign: {
        default: "left",
        parseHTML: (element: HTMLElement) => {
          const raw = element.style.textAlign?.toLowerCase() ?? "left";
          if (raw === "center" || raw === "right") {
            return raw;
          }
          return "left";
        },
        renderHTML: (attributes: { textAlign?: string }) => {
          const textAlign =
            attributes.textAlign === "center" || attributes.textAlign === "right"
              ? attributes.textAlign
              : "left";

          if (textAlign === "left") {
            return {};
          }

          return {
            style: `text-align: ${textAlign};`,
          };
        },
      },
    };
  },
});

const TyporaTable = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "left",
        parseHTML: (element: HTMLElement) => {
          const value = element.getAttribute("data-align");
          if (value === "center" || value === "right") {
            return value;
          }
          return "left";
        },
        renderHTML: (attributes: { align?: string }) => {
          const align =
            attributes.align === "center" || attributes.align === "right"
              ? attributes.align
              : "left";
          return {
            "data-align": align,
          };
        },
      },
    };
  },
});

const KeyboardBehavior = Extension.create({
  name: "keyboardBehavior",
  addKeyboardShortcuts() {
    const convertTaskMarker = () => {
      const { state } = this.editor;
      const { selection } = state;

      if (!selection.empty) {
        return false;
      }

      const { $from } = selection;
      if ($from.parent.type.name !== "paragraph") {
        return false;
      }

      if ($from.parentOffset !== $from.parent.content.size) {
        return false;
      }

      const textBeforeCursor = $from.parent.textBetween(
        0,
        $from.parentOffset,
        undefined,
        "\ufffc",
      );
      const fullMarkerMatch = textBeforeCursor.match(/^\s*[-+*]\s\[( |x|X)\]$/);
      const bulletMarkerMatch = textBeforeCursor.match(/^\s*\[( |x|X)\]$/);
      const inBulletList = this.editor.isActive("bulletList") || this.editor.isActive("listItem");
      const match = fullMarkerMatch ?? (inBulletList ? bulletMarkerMatch : null);
      if (!match) {
        return false;
      }

      const checked = match[1].toLowerCase() === "x";
      const from = $from.pos - $from.parentOffset;
      const to = $from.pos;

      this.editor.chain().focus().deleteRange({ from, to }).toggleTaskList().run();
      if (checked) {
        this.editor.commands.updateAttributes("taskItem", { checked: true });
      }

      return true;
    };

    return {
      Space: convertTaskMarker,
      Spacebar: convertTaskMarker,
      " ": convertTaskMarker,
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
      Backspace: () => {
        const { state, view } = this.editor;
        const { selection } = state;

        if (!selection.empty) {
          return false;
        }

        const { $from } = selection;
        if ($from.parent.type.name !== "codeBlock") {
          return false;
        }

        if ($from.parent.textContent.length > 0) {
          return false;
        }

        const paragraphNode = state.schema.nodes.paragraph?.create();
        if (!paragraphNode) {
          return false;
        }

        const from = $from.before();
        const to = $from.after();
        let tr = state.tr.replaceWith(from, to, paragraphNode);
        tr = tr.setSelection(TextSelection.create(tr.doc, from + 1));
        view.dispatch(tr.scrollIntoView());
        return true;
      },
      Tab: () => {
        if (this.editor.isActive("codeBlock")) {
          return false;
        }

        if (this.editor.can().sinkListItem("taskItem")) {
          return this.editor.commands.sinkListItem("taskItem");
        }

        if (this.editor.can().sinkListItem("listItem")) {
          return this.editor.commands.sinkListItem("listItem");
        }

        return false;
      },
      "Shift-Tab": () => {
        if (this.editor.can().liftListItem("taskItem")) {
          return this.editor.commands.liftListItem("taskItem");
        }

        if (this.editor.can().liftListItem("listItem")) {
          return this.editor.commands.liftListItem("listItem");
        }

        if (
          (this.editor.isActive("taskItem") || this.editor.isActive("listItem")) &&
          exitListItemToParagraph(this.editor)
        ) {
          return true;
        }

        return false;
      },
    };
  },
});

const HeadingHintBehavior = Extension.create({
  name: "headingHintBehavior",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          decorations(state) {
            const { $from } = state.selection;
            for (let depth = $from.depth; depth > 0; depth -= 1) {
              const node = $from.node(depth);
              if (node.type.name !== "heading") {
                continue;
              }

              const level = Number(node.attrs.level);
              if (level < 3 || level > 6) {
                return null;
              }

              const from = $from.before(depth);
              const to = from + node.nodeSize;

              return DecorationSet.create(state.doc, [
                Decoration.node(from, to, {
                  [HEADING_HINT_ATTR]: `h${level}`,
                }),
              ]);
            }

            return null;
          },
        },
      }),
    ];
  },
});

const MarkdownPasteBehavior = Extension.create({
  name: "markdownPasteBehavior",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: (_view, event) => {
            const text = event.clipboardData?.getData("text/plain") ?? "";
            if (!shouldParsePastedMarkdown(text)) {
              return false;
            }

            const parsedHtml = convertMarkdownToHtml(text).trim();
            if (!parsedHtml) {
              return false;
            }

            event.preventDefault();
            this.editor
              .chain()
              .focus()
              .insertContent(parsedHtml, {
                parseOptions: {
                  preserveWhitespace: false,
                },
              })
              .run();

            return true;
          },
        },
      }),
    ];
  },
});

const FOOTNOTE_REF_PATTERN = /\[\^([^\]\s]+)\](?!:)/g;
const FOOTNOTE_DEF_PATTERN = /^\[\^([^\]\s]+)\]:/;

interface FootnoteDecorationState {
  decorations: DecorationSet;
  definitionPosByLabel: Record<string, number>;
  firstReferencePosByLabel: Record<string, number>;
}

const FOOTNOTE_PLUGIN_KEY = new PluginKey<FootnoteDecorationState>(
  "hm-footnote-syntax",
);

const buildFootnoteDecorationState = (
  doc: ProseMirrorNode,
  selectionFrom: number,
  selectionTo: number,
): FootnoteDecorationState => {
  const definitionPosByLabel: Record<string, number> = {};
  const definitionEndByLabel: Record<string, number> = {};
  const firstReferencePosByLabel: Record<string, number> = {};
  const references: Array<{ label: string; from: number; to: number }> = [];
  const definitionBlocks: Array<{
    label: string;
    from: number;
    to: number;
    tokenFrom: number;
    tokenTo: number;
    hasDescription: boolean;
  }> = [];

  doc.descendants((node, pos) => {
    if (!node.isTextblock) {
      return true;
    }

    const text = node.textContent;
    if (!text) {
      return true;
    }

    const textStart = pos + 1;
    const definitionMatch = text.match(FOOTNOTE_DEF_PATTERN);
    if (definitionMatch) {
      const label = definitionMatch[1];
      const tokenLength = definitionMatch[0].length;
      const tokenFrom = textStart;
      const tokenTo = textStart + tokenLength;
      const hasDescription = text.slice(tokenLength).trim().length > 0;
      definitionPosByLabel[label] = tokenFrom;
      definitionEndByLabel[label] = pos + node.nodeSize - 1;
      definitionBlocks.push({
        label,
        from: pos,
        to: pos + node.nodeSize,
        tokenFrom,
        tokenTo,
        hasDescription,
      });
    }

    FOOTNOTE_REF_PATTERN.lastIndex = 0;
    let match = FOOTNOTE_REF_PATTERN.exec(text);
    while (match) {
      const label = match[1];
      const from = textStart + match.index;
      const to = from + match[0].length;
      references.push({ label, from, to });
      if (firstReferencePosByLabel[label] === undefined) {
        firstReferencePosByLabel[label] = from;
      }
      match = FOOTNOTE_REF_PATTERN.exec(text);
    }

    return true;
  });

  const decorations: Decoration[] = [];
  const editingDefinitionLabels = new Set<string>();

  definitionBlocks.forEach(
    ({ label, from, to, tokenFrom, tokenTo, hasDescription }) => {
      const contentFrom = from + 1;
      const contentTo = to - 1;
      const isEditingDefinitionLine =
        selectionFrom >= contentFrom && selectionTo <= contentTo;

      decorations.push(
        Decoration.node(from, to, {
          class: "hm-footnote-definition-line",
        }),
      );

      if (isEditingDefinitionLine) {
        editingDefinitionLabels.add(label);
        decorations.push(
          Decoration.inline(tokenFrom, tokenTo, {
            class: "hm-footnote-token-editing",
          }),
        );
      } else {
        decorations.push(
          Decoration.inline(tokenFrom, tokenTo, {
            class: "hm-footnote-source-hidden",
          }),
        );
        decorations.push(
          Decoration.widget(
            tokenFrom,
            () => {
              const token = document.createElement("span");
              token.className = "hm-footnote-definition-token";
              token.textContent = `[${label}]:`;
              return token;
            },
            { side: 1, ignoreSelection: true },
          ),
        );

        if (!hasDescription) {
          decorations.push(
            Decoration.widget(
              tokenTo,
              () => {
                const placeholder = document.createElement("span");
                placeholder.className = "hm-footnote-definition-placeholder";
                placeholder.textContent = "input description here";
                return placeholder;
              },
              { side: 1, ignoreSelection: true },
            ),
          );
        }
      }

    },
  );

  references.forEach(({ label, from, to }) => {
    const hasDefinition = definitionPosByLabel[label] !== undefined;
    const isEditingCurrentToken = selectionFrom >= from && selectionTo <= to;

    if (isEditingCurrentToken) {
      decorations.push(
        Decoration.inline(from, to, {
          class: "hm-footnote-token-editing",
        }),
      );
      return;
    }

    decorations.push(
      Decoration.inline(from, to, {
        class: "hm-footnote-source-hidden",
      }),
    );
    decorations.push(
      Decoration.widget(
        from,
        () => {
          const token = document.createElement("span");
          token.className = `hm-footnote-ref-token ${
            hasDefinition
              ? "hm-footnote-ref-token-valid"
              : "hm-footnote-ref-token-missing"
          }`;
          token.textContent = `[${label}]`;
          token.setAttribute("data-hm-footnote-label", label);
          return token;
        },
        { side: 1, ignoreSelection: true },
      ),
    );
  });

  Object.entries(definitionEndByLabel).forEach(([label, definitionEnd]) => {
    const hasRef = Boolean(firstReferencePosByLabel[label]);
    const isEditingDefinitionLine = editingDefinitionLabels.has(label);
    const canJump = hasRef;

    decorations.push(
      Decoration.widget(
        definitionEnd,
        () => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = canJump
            ? "hm-footnote-backref-btn"
            : "hm-footnote-backref-btn hm-footnote-backref-btn-disabled";
          button.textContent = "↩";
          button.setAttribute("data-hm-footnote-back-label", label);
          button.setAttribute("data-hm-footnote-back-enabled", canJump ? "true" : "false");
          button.setAttribute(
            "data-hm-footnote-back-editing",
            isEditingDefinitionLine ? "true" : "false",
          );
          button.setAttribute("aria-label", `跳转到注脚引用 ${label}`);
          button.setAttribute("tabindex", "-1");
          button.addEventListener("mousedown", (event) => {
            event.preventDefault();
          });
          return button;
        },
        { side: 1, ignoreSelection: true },
      ),
    );
  });

  return {
    decorations: DecorationSet.create(doc, decorations),
    definitionPosByLabel,
    firstReferencePosByLabel,
  };
};

const FootnoteSyntaxBehavior = Extension.create({
  name: "footnoteSyntaxBehavior",
  addProseMirrorPlugins() {
    const handleFootnoteClick = (
      view: EditorView,
      event: MouseEvent,
    ): boolean => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      const state = FOOTNOTE_PLUGIN_KEY.getState(view.state);
      if (!state) {
        return false;
      }

      const backrefTarget = target.closest<HTMLElement>(
        "[data-hm-footnote-back-label]",
      );
      if (backrefTarget) {
        if (backrefTarget.dataset.hmFootnoteBackEnabled !== "true") {
          return true;
        }

        const label = backrefTarget.dataset.hmFootnoteBackLabel;
        const refPos = label ? state.firstReferencePosByLabel[label] : undefined;
        if (!refPos) {
          return false;
        }

        const nextSelection = TextSelection.near(
          view.state.doc.resolve(refPos),
          1,
        );
        const tr = view.state.tr.setSelection(nextSelection);
        view.dispatch(tr.scrollIntoView());
        view.focus();
        return true;
      }

      const refTarget = target.closest<HTMLElement>(
        ".hm-footnote-ref-token[data-hm-footnote-label]",
      );
      if (!refTarget) {
        return false;
      }

      if (!event.metaKey && !event.ctrlKey) {
        return false;
      }

      const label = refTarget.dataset.hmFootnoteLabel;
      const defPos = label ? state.definitionPosByLabel[label] : undefined;
      if (!defPos) {
        return false;
      }

      const nextSelection = TextSelection.near(
        view.state.doc.resolve(defPos),
        1,
      );
      const tr = view.state.tr.setSelection(nextSelection);
      view.dispatch(tr.scrollIntoView());
      view.focus();
      return true;
    };

    return [
      new Plugin<FootnoteDecorationState>({
        key: FOOTNOTE_PLUGIN_KEY,
        state: {
          init: (_, state) =>
            buildFootnoteDecorationState(
              state.doc,
              state.selection.from,
              state.selection.to,
            ),
          apply: (tr, current, _oldState, newState) => {
            if (!tr.docChanged && !tr.selectionSet) {
              return current;
            }

            return buildFootnoteDecorationState(
              newState.doc,
              newState.selection.from,
              newState.selection.to,
            );
          },
        },
        props: {
          decorations(state) {
            return FOOTNOTE_PLUGIN_KEY.getState(state)?.decorations ?? null;
          },
          handleClick(view, _pos, event) {
            return handleFootnoteClick(view, event);
          },
          handleDOMEvents: {
            click(view, event) {
              return handleFootnoteClick(view, event as MouseEvent);
            },
          },
        },
      }),
    ];
  },
});

export interface HybricEditorProps {
  content?: Content;
  onChange?: (editor: Editor) => void;
  onExtract?: (data: ExtractCardData) => void;
  editable?: boolean;
  className?: string;
}

const HybricEditorComponent = ({
  content,
  onChange,
  onExtract,
  editable = true,
  className,
}: HybricEditorProps) => {
  const onChangeRef = useRef(onChange);
  const [initialContent] = useState<Content | undefined>(() => normalizeIncomingContent(content));
  const lastExternalContentSignatureRef = useRef("");
  const [tableTooltip, setTableTooltip] = useState<TableTooltipState>({
    visible: false,
    top: 0,
    left: 0,
    cellPos: null,
  });
  const [tableSizePickerOpen, setTableSizePickerOpen] = useState(false);
  const [tableRowsInput, setTableRowsInput] = useState("3");
  const [tableColsInput, setTableColsInput] = useState("3");
  const [linkHoverTooltip, setLinkHoverTooltip] = useState<LinkHoverTooltipState>({
    visible: false,
    href: "",
    top: 0,
    left: 0,
  });
  const linkHoverTimerRef = useRef<number | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    return () => {
      if (linkHoverTimerRef.current !== null) {
        window.clearTimeout(linkHoverTimerRef.current);
        linkHoverTimerRef.current = null;
      }
    };
  }, []);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        link: false,
      }),
      HtmlBlock,
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
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          loading: "lazy",
          decoding: "async",
        },
      }),
      TyporaTable.configure({
        resizable: true,
        lastColumnResizable: false,
      }),
      TableRow,
      TyporaTableHeader,
      TyporaTableCell,
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
      HeadingHintBehavior,
      MarkdownPasteBehavior,
      FootnoteSyntaxBehavior,
    ],
    [],
  );

  const editor = useEditor({
    extensions,
    content: initialContent,
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
        const target = mouseEvent.target;
        if (!(target instanceof Element)) {
          return false;
        }

        const anchor = target.closest("a");
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

        if (!isSafeUrl(href)) {
          return true;
        }

        window.open(href, "_blank", "noopener,noreferrer");
        return true;
      },
      handleDOMEvents: {
        mouseover: (view, event) => {
          const target = event.target;
          if (!(target instanceof Element)) {
            return false;
          }

          const anchor = target.closest("a[href]");
          if (!(anchor instanceof HTMLAnchorElement)) {
            return false;
          }

          const href = anchor.getAttribute("href") ?? "";
          if (!href) {
            return false;
          }

          if (linkHoverTimerRef.current !== null) {
            window.clearTimeout(linkHoverTimerRef.current);
            linkHoverTimerRef.current = null;
          }

          linkHoverTimerRef.current = window.setTimeout(() => {
            const root = view.dom.closest(".hm-editor-root");
            if (!(root instanceof HTMLElement)) {
              return;
            }
            const rootRect = root.getBoundingClientRect();
            const anchorRect = anchor.getBoundingClientRect();
            setLinkHoverTooltip({
              visible: true,
              href,
              left: anchorRect.left - rootRect.left,
              top: anchorRect.bottom - rootRect.top + 8,
            });
            linkHoverTimerRef.current = null;
          }, 500);

          return false;
        },
        mouseout: (_view, event) => {
          const target = event.target;
          if (!(target instanceof Element)) {
            return false;
          }

          if (linkHoverTimerRef.current !== null) {
            window.clearTimeout(linkHoverTimerRef.current);
            linkHoverTimerRef.current = null;
          }

          const anchor = target.closest("a[href]");
          if (anchor) {
            setLinkHoverTooltip((prev) =>
              prev.visible ? { ...prev, visible: false } : prev,
            );
          }
          return false;
        },
        mousedown: () => {
          if (linkHoverTimerRef.current !== null) {
            window.clearTimeout(linkHoverTimerRef.current);
            linkHoverTimerRef.current = null;
          }
          setLinkHoverTooltip((prev) =>
            prev.visible ? { ...prev, visible: false } : prev,
          );
          return false;
        },
      },
    },
  });

  useEffect(() => {
    lastExternalContentSignatureRef.current = getContentSignature(initialContent);
  }, [initialContent]);

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

    const normalizedExternalContent = normalizeIncomingContent(content);
    const nextSignature = getContentSignature(normalizedExternalContent);

    if (nextSignature === lastExternalContentSignatureRef.current) {
      return;
    }

    if (editor.isFocused || editor.view.composing) {
      return;
    }

    const currentEditorSignature = getContentSignature(editor.getJSON());
    if (currentEditorSignature === nextSignature) {
      lastExternalContentSignatureRef.current = nextSignature;
      return;
    }

    editor.commands.setContent(normalizedExternalContent ?? "<p></p>", {
      emitUpdate: false,
    });
    migrateMathStrings(editor);
    lastExternalContentSignatureRef.current = nextSignature;
  }, [content, editor]);

  const hideTableTooltip = useCallback(() => {
    setTableSizePickerOpen(false);
    setTableTooltip((prev) =>
      prev.visible
        ? { ...prev, visible: false, cellPos: null }
        : prev,
    );
  }, []);

  const resolveTableSelection = useCallback(() => {
    if (!editor) {
      return {
        cellPos: null as number | null,
        tablePos: null as number | null,
      };
    }

    const { $from } = editor.state.selection;
    let cellPos: number | null = null;
    let tablePos: number | null = null;

    for (let depth = $from.depth; depth > 0; depth -= 1) {
      const typeName = $from.node(depth).type.name;
      if (typeName === "tableCell" || typeName === "tableHeader") {
        cellPos = $from.before(depth);
      }
      if ($from.node(depth).type.name !== "table") {
        continue;
      }
      tablePos = $from.before(depth);
      break;
    }

    return { cellPos, tablePos };
  }, [editor]);

  const refreshTableTooltip = useCallback(() => {
    if (!editor || (!editor.isFocused && !tableSizePickerOpen)) {
      hideTableTooltip();
      return;
    }

    const { cellPos, tablePos } = resolveTableSelection();

    if (tablePos === null) {
      hideTableTooltip();
      return;
    }

    const anchorPos = tablePos;
    const anchorNode = editor.view.nodeDOM(anchorPos);
    const rootNode = editor.view.dom.closest(".hm-editor-root");
    if (!(anchorNode instanceof HTMLElement) || !(rootNode instanceof HTMLElement)) {
      hideTableTooltip();
      return;
    }

    const anchorRect = anchorNode.getBoundingClientRect();
    const rootRect = rootNode.getBoundingClientRect();

    let top = anchorRect.top - rootRect.top - TABLE_TOOLTIP_OFFSET;
    if (top < TABLE_TOOLTIP_MIN_TOP) {
      top = TABLE_TOOLTIP_MIN_TOP;
    }

    setTableTooltip({
      visible: true,
      top,
      left: anchorRect.left - rootRect.left + 4,
      cellPos,
    });
  }, [editor, hideTableTooltip, resolveTableSelection, tableSizePickerOpen]);

  const getCurrentTableSize = useCallback(() => {
    const { tablePos } = resolveTableSelection();
    if (tablePos === null || !editor) {
      return null;
    }

    const node = editor.view.state.doc.nodeAt(tablePos);
    if (!node || node.type.name !== "table") {
      return null;
    }

    const rows = node.childCount;
    const cols = rows > 0 ? node.child(0).childCount : 0;
    if (rows <= 0 || cols <= 0) {
      return null;
    }

    return { rows, cols };
  }, [editor, resolveTableSelection]);

  const focusTableCell = useCallback(
    (rowIndex: number, colIndex: number): boolean => {
      if (!editor) {
        return false;
      }

      const { tablePos } = resolveTableSelection();
      if (tablePos === null) {
        return false;
      }

      const tableNode = editor.view.state.doc.nodeAt(tablePos);
      if (!tableNode || tableNode.type.name !== "table" || tableNode.childCount === 0) {
        return false;
      }

      const safeRow = Math.max(0, Math.min(rowIndex, tableNode.childCount - 1));
      const colsInRow = tableNode.child(safeRow).childCount;
      if (colsInRow <= 0) {
        return false;
      }
      const safeCol = Math.max(0, Math.min(colIndex, colsInRow - 1));

      const map = TableMap.get(tableNode);
      const tableStart = tablePos + 1;
      const cellPos = tableStart + map.positionAt(safeRow, safeCol, tableNode);
      const selectionPos = Math.max(
        1,
        Math.min(cellPos + 1, editor.state.doc.content.size),
      );
      const resolved = editor.state.doc.resolve(selectionPos);
      const tr = editor.state.tr.setSelection(TextSelection.near(resolved, 1));
      editor.view.dispatch(tr);
      return true;
    },
    [editor, resolveTableSelection],
  );

  const withTableSelection = useCallback(
    (action: () => void) => {
      if (!editor) {
        return;
      }

      if (isTableCellSelection(editor.state.selection)) {
        editor.view.focus();
        action();
        refreshTableTooltip();
        return;
      }

      const { cellPos, tablePos } = resolveTableSelection();
      if (tablePos === null) {
        return;
      }

      const maxPos = editor.state.doc.content.size;
      let rawPos = cellPos ?? tableTooltip.cellPos ?? null;
      if (rawPos === null) {
        const tableNode = editor.state.doc.nodeAt(tablePos);
        if (tableNode && tableNode.type.name === "table" && tableNode.childCount > 0) {
          const map = TableMap.get(tableNode);
          rawPos = tablePos + 1 + map.positionAt(0, 0, tableNode);
        }
      }
      if (rawPos === null) {
        rawPos = tablePos + 1;
      }
      const safePos = Math.max(1, Math.min(rawPos + 1, maxPos));
      const resolved = editor.state.doc.resolve(safePos);
      const nextSelection = TextSelection.near(resolved, 1);
      const tr = editor.state.tr.setSelection(nextSelection);

      editor.view.dispatch(tr);
      editor.commands.focus();
      action();
      refreshTableTooltip();
    },
    [editor, refreshTableTooltip, resolveTableSelection, tableTooltip.cellPos],
  );

  const applyTableAlign = useCallback(
    (align: TableAlign) => {
      withTableSelection(() => {
        editor?.chain().setCellAttribute("textAlign", align).run();
      });
    },
    [editor, withTableSelection],
  );

  const applyTableSize = useCallback(
    (rows: number, cols: number) => {
      if (!editor) {
        return;
      }

      const targetRows = clampTableDimension(rows);
      const targetCols = clampTableDimension(cols);

      withTableSelection(() => {
        let guard = 0;
        while (guard < 64) {
          guard += 1;
          const current = getCurrentTableSize();
          if (!current) {
            break;
          }

          if (current.cols < targetCols) {
            if (!focusTableCell(0, Math.max(0, current.cols - 1))) {
              break;
            }
            if (!editor.chain().focus().addColumnAfter().run()) {
              break;
            }
            continue;
          }

          if (current.cols > targetCols && current.cols > 1) {
            if (!focusTableCell(0, current.cols - 1)) {
              break;
            }
            if (!editor.chain().focus().deleteColumn().run()) {
              break;
            }
            continue;
          }

          if (current.rows < targetRows) {
            if (!focusTableCell(Math.max(0, current.rows - 1), 0)) {
              break;
            }
            if (!editor.chain().focus().addRowAfter().run()) {
              break;
            }
            continue;
          }

          if (current.rows > targetRows && current.rows > 1) {
            if (!focusTableCell(current.rows - 1, 0)) {
              break;
            }
            if (!editor.chain().focus().deleteRow().run()) {
              break;
            }
            continue;
          }

          break;
        }
      });
    },
    [editor, focusTableCell, getCurrentTableSize, withTableSelection],
  );

  const toggleTableSizePicker = useCallback(() => {
    const size = getCurrentTableSize();
    if (size) {
      setTableRowsInput(String(size.rows));
      setTableColsInput(String(size.cols));
    }
    setTableSizePickerOpen((prev) => !prev);
  }, [getCurrentTableSize]);

  const confirmTableSize = useCallback(() => {
    const rows = parseTableDimensionInput(tableRowsInput);
    const cols = parseTableDimensionInput(tableColsInput);
    if (rows === null || cols === null) {
      console.warn("[HybricEditor] invalid table size input");
      return;
    }

    applyTableSize(rows, cols);
    setTableSizePickerOpen(false);
  }, [applyTableSize, tableColsInput, tableRowsInput]);

  const setTableAlign = useCallback(
    (align: TableAlign) => () => {
      applyTableAlign(align);
    },
    [applyTableAlign],
  );

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleUpdate = () => {
      // Note: This editor is uncontrolled. Do not force-update 'content' prop on every keystroke to avoid breaking Chinese IME.
      console.log("[HybricEditor] doc:", editor.getJSON());
      onChangeRef.current?.(editor);
    };

    handleUpdate();
    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleEditorBlur = () => {
      setLinkHoverTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      window.setTimeout(() => {
        const root = editor.view.dom.closest(".hm-editor-root");
        const tooltip = root?.querySelector(".hm-table-tooltip");
        const activeElement = document.activeElement;
        if (
          tooltip instanceof HTMLElement &&
          activeElement instanceof HTMLElement &&
          tooltip.contains(activeElement)
        ) {
          return;
        }
        hideTableTooltip();
      }, 0);
    };

    const onScroll = () => {
      setLinkHoverTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      refreshTableTooltip();
    };
    const onResize = () => {
      setLinkHoverTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      refreshTableTooltip();
    };
    const initFrame = window.requestAnimationFrame(refreshTableTooltip);

    editor.on("selectionUpdate", refreshTableTooltip);
    editor.on("focus", refreshTableTooltip);
    editor.on("blur", handleEditorBlur);
    editor.on("transaction", refreshTableTooltip);

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(initFrame);
      editor.off("selectionUpdate", refreshTableTooltip);
      editor.off("focus", refreshTableTooltip);
      editor.off("blur", handleEditorBlur);
      editor.off("transaction", refreshTableTooltip);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [editor, hideTableTooltip, refreshTableTooltip]);

  return (
    <div className={twMerge("hm-editor-root", className)}>
      {tableTooltip.visible && (
        <div
          className="hm-table-tooltip"
          style={{
            top: `${tableTooltip.top}px`,
            left: `${tableTooltip.left}px`,
          }}
        >
          <div className="hm-table-tooltip-group">
            <button
              type="button"
              className="hm-table-tooltip-btn"
              onMouseDown={(event) => event.preventDefault()}
              onClick={toggleTableSizePicker}
              aria-label="调整表格行列"
              title="调整表格行列"
            >
              <Grid2x2 size={14} />
            </button>
            <button
              type="button"
              className="hm-table-tooltip-btn"
              onMouseDown={(event) => event.preventDefault()}
              onClick={setTableAlign("left")}
              aria-label="Align table left"
              title="Align left"
            >
              <AlignLeft size={14} />
            </button>
            <button
              type="button"
              className="hm-table-tooltip-btn"
              onMouseDown={(event) => event.preventDefault()}
              onClick={setTableAlign("center")}
              aria-label="Align table center"
              title="Align center"
            >
              <AlignCenter size={14} />
            </button>
            <button
              type="button"
              className="hm-table-tooltip-btn"
              onMouseDown={(event) => event.preventDefault()}
              onClick={setTableAlign("right")}
              aria-label="Align table right"
              title="Align right"
            >
              <AlignRight size={14} />
            </button>
          </div>
          {tableSizePickerOpen && (
            <div className="hm-table-size-popover">
              <div className="hm-table-size-row">
                <label htmlFor="hm-table-cols-input">列数：</label>
                <input
                  id="hm-table-cols-input"
                  type="text"
                  inputMode="numeric"
                  value={tableColsInput}
                  onChange={(event) => setTableColsInput(event.target.value)}
                  placeholder="3"
                />
              </div>
              <div className="hm-table-size-row">
                <label htmlFor="hm-table-rows-input">行数：</label>
                <input
                  id="hm-table-rows-input"
                  type="text"
                  inputMode="numeric"
                  value={tableRowsInput}
                  onChange={(event) => setTableRowsInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      confirmTableSize();
                    }
                  }}
                  placeholder="3"
                />
              </div>
              <div className="hm-table-size-actions">
                <button type="button" onClick={confirmTableSize}>
                  应用
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {linkHoverTooltip.visible && (
        <div
          className="hm-link-hover-tooltip"
          style={{
            top: `${linkHoverTooltip.top}px`,
            left: `${linkHoverTooltip.left}px`,
          }}
        >
          {linkHoverTooltip.href}
        </div>
      )}
      <EditorContextMenu editor={editor} onExtract={onExtract}>
        <EditorContent editor={editor} />
      </EditorContextMenu>
    </div>
  );
};

export const HybricEditor = memo(HybricEditorComponent);
HybricEditor.displayName = "HybricEditor";

