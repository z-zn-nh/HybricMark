import * as ContextMenu from "@radix-ui/react-context-menu";
import type { Editor, JSONContent } from "@tiptap/core";
import { Fragment, type Node as ProseMirrorNode } from "@tiptap/pm/model";
import { TextSelection } from "@tiptap/pm/state";
import { CellSelection, TableMap } from "@tiptap/pm/tables";
import {
  ArrowDown,
  ArrowUp,
  Bold,
  ChevronRight,
  ClipboardPaste,
  Code,
  Code2,
  Copy,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Highlighter,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Plus,
  Quote,
  RemoveFormatting,
  SeparatorHorizontal,
  Sigma,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  Trash2,
  Underline,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { createPortal } from "react-dom";

export interface ExtractCardData {
  id: string;
  content: JSONContent;
}

export interface EditorContextMenuProps {
  editor: Editor | null;
  children: ReactNode;
  onExtract?: (data: ExtractCardData) => void;
}

interface ActiveBlock {
  type: string;
  pos: number;
  nodeSize: number;
  id: string | null;
  content: JSONContent;
}

interface MenuState {
  mode: "normal" | "table";
  referencePos: number | null;
  linkHref: string | null;
  clientX: number | null;
  clientY: number | null;
}

const CONTENT_CLASS = "hm-context-menu";
const LABEL_CLASS = "hm-context-menu-label";
const ITEM_CLASS = "hm-context-menu-item";
const DANGER_ITEM_CLASS = "hm-context-menu-item hm-context-menu-item-danger";
const LEADING_CLASS = "hm-context-menu-item-leading";
const ICON_CLASS = "hm-context-menu-icon";
const SEPARATOR_CLASS = "hm-context-menu-separator";
const SHORTCUT_CLASS = "hm-context-menu-shortcut";

const IS_MAC =
  typeof navigator !== "undefined" &&
  /Mac|iPod|iPhone|iPad/i.test(navigator.platform);

const formatShortcut = (combo: string): string =>
  combo
    .split("+")
    .map((part) => {
      if (part === "Mod") {
        return IS_MAC ? "⌘" : "Ctrl";
      }
      if (part === "Alt") {
        return IS_MAC ? "⌥" : "Alt";
      }
      if (part === "Shift") {
        return IS_MAC ? "⇧" : "Shift";
      }
      if (part === "Backspace") {
        return IS_MAC ? "⌫" : "Backspace";
      }
      if (part === "ArrowUp") {
        return IS_MAC ? "↑" : "Up";
      }
      if (part === "ArrowDown") {
        return IS_MAC ? "↓" : "Down";
      }
      return part.toUpperCase();
    })
    .join(IS_MAC ? "" : "+");

const normalizeEventKey = (key: string): string => {
  if (key.length === 1) {
    return key.toLowerCase();
  }
  return key;
};

const matchShortcut = (event: KeyboardEvent, combo: string): boolean => {
  const parts = combo.split("+");
  const keyPart = parts.find(
    (part) => part !== "Mod" && part !== "Shift" && part !== "Alt",
  );
  if (!keyPart) {
    return false;
  }

  const wantMod = parts.includes("Mod");
  const wantShift = parts.includes("Shift");
  const wantAlt = parts.includes("Alt");
  const wantKey = normalizeEventKey(keyPart);
  const gotKey = normalizeEventKey(event.key);
  const gotMod = IS_MAC ? event.metaKey : event.ctrlKey;

  if (gotMod !== wantMod) {
    return false;
  }
  if (event.shiftKey !== wantShift) {
    return false;
  }
  if (event.altKey !== wantAlt) {
    return false;
  }
  if (event.metaKey && !IS_MAC) {
    return false;
  }
  if (event.ctrlKey && IS_MAC && !wantMod) {
    return false;
  }

  return gotKey === wantKey;
};

const showToast = (message: string) => {
  const toast = document.createElement("div");
  toast.className = "hm-toast";
  toast.textContent = message;
  Object.assign(toast.style, {
    position: "fixed",
    left: "50%",
    top: "20px",
    transform: "translateX(-50%)",
    background: "#0f172a",
    color: "#f8fafc",
    border: "1px solid #1e293b",
    padding: "10px 16px",
    borderRadius: "8px",
    fontSize: "12px",
    lineHeight: "1.2",
    fontWeight: "600",
    letterSpacing: "0.01em",
    boxShadow: "0 12px 28px rgba(2, 6, 23, 0.35)",
    zIndex: "9999",
    opacity: "1",
    transition: "opacity 180ms ease, transform 180ms ease",
    pointerEvents: "none",
  } satisfies Partial<CSSStyleDeclaration>);

  document.body.appendChild(toast);

  window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(-4px)";
    window.setTimeout(() => {
      toast.remove();
    }, 180);
  }, 1100);
};

const copyTextLegacy = (text: string): boolean => {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "true");
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const copied = document.execCommand("copy");
    textArea.remove();
    return copied;
  } catch {
    return false;
  }
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
        return;
      }
      reject(new Error("文件读取失败"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });

const pickImageFile = (): Promise<File | null> =>
  new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    const cleanup = () => {
      input.remove();
    };

    input.addEventListener(
      "change",
      () => {
        const file = input.files?.[0] ?? null;
        cleanup();
        resolve(file);
      },
      { once: true },
    );

    input.addEventListener(
      "cancel",
      () => {
        cleanup();
        resolve(null);
      },
      { once: true } as AddEventListenerOptions,
    );

    input.click();
  });

const findActiveBlock = (
  editor: Editor,
  referencePos: number | null,
): ActiveBlock | null => {
  const fallbackPos = editor.state.selection.from;
  const maxPos = editor.state.doc.content.size;
  const rawPos = typeof referencePos === "number" ? referencePos : fallbackPos;
  const safePos = Math.max(1, Math.min(rawPos, maxPos));
  const $pos = editor.state.doc.resolve(safePos);

  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth);
    if (!node.isBlock) {
      continue;
    }

    const pos = $pos.before(depth);
    const rawId = node.attrs.id;

    return {
      type: node.type.name,
      pos,
      nodeSize: node.nodeSize,
      id: typeof rawId === "string" ? rawId : null,
      content: node.toJSON() as JSONContent,
    };
  }

  return null;
};

const isInsideTableAtPos = (
  editor: Editor,
  referencePos: number | null,
): boolean => {
  const fallbackPos = editor.state.selection.from;
  const maxPos = editor.state.doc.content.size;
  const rawPos = typeof referencePos === "number" ? referencePos : fallbackPos;
  const safePos = Math.max(1, Math.min(rawPos, maxPos));
  const $pos = editor.state.doc.resolve(safePos);

  for (let depth = $pos.depth; depth >= 0; depth -= 1) {
    if ($pos.node(depth).type.name === "table") {
      return true;
    }
  }

  return false;
};

const normalizeUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const FOOTNOTE_DEF_CLEAR_PATTERN = /\[\^([^\]\s]+)\]:/g;
const FOOTNOTE_REF_CLEAR_PATTERN = /\[\^([^\]\s]+)\]/g;

const clearFootnoteSyntax = (value: string): string =>
  value
    .replace(FOOTNOTE_DEF_CLEAR_PATTERN, "[$1]:")
    .replace(FOOTNOTE_REF_CLEAR_PATTERN, "[$1]");

const liftOutOfAllLists = (editor: Editor): boolean => {
  let changed = false;
  let guard = 0;

  while (guard < 32) {
    guard += 1;
    if (editor.can().liftListItem("taskItem")) {
      editor.chain().focus().liftListItem("taskItem").run();
      changed = true;
      continue;
    }
    if (editor.can().liftListItem("listItem")) {
      editor.chain().focus().liftListItem("listItem").run();
      changed = true;
      continue;
    }
    break;
  }

  return changed;
};

const convertCurrentListItemToParagraph = (editor: Editor): boolean => {
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
  const plainText = clearFootnoteSyntax(firstTextblock.textContent ?? "");
  const paragraphContent = plainText.length > 0 ? state.schema.text(plainText) : null;

  const itemIndex = $from.index(listDepth);
  if (itemIndex < 0 || itemIndex >= listNode.childCount) {
    return false;
  }

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
  replacement.push(paragraphNodeType.create(null, paragraphContent));
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
  const beforeSize = replacement.length > 0 && beforeItems.length > 0
    ? replacement[0].nodeSize
    : 0;
  const cursorPos = Math.max(
    1,
    Math.min(listPos + beforeSize + 1, tr.doc.content.size),
  );
  tr = tr.setSelection(TextSelection.near(tr.doc.resolve(cursorPos), 1));
  view.dispatch(tr.scrollIntoView());
  editor.commands.focus();
  return true;
};

const FOOTNOTE_TOKEN_PATTERN = /\[\^([^\]\s]+)\](?::)?/g;

const getNextFootnoteKey = (editor: Editor): string => {
  const used = new Set<string>();

  editor.state.doc.descendants((node) => {
    if (!node.isText) {
      return true;
    }

    const text = node.text ?? "";
    FOOTNOTE_TOKEN_PATTERN.lastIndex = 0;
    let match = FOOTNOTE_TOKEN_PATTERN.exec(text);
    while (match) {
      used.add(match[1]);
      match = FOOTNOTE_TOKEN_PATTERN.exec(text);
    }

    return true;
  });

  let candidate = 1;
  while (used.has(String(candidate))) {
    candidate += 1;
  }

  return String(candidate);
};

const clampTableSize = (value: number): number =>
  Math.max(1, Math.min(20, Number.isFinite(value) ? Math.floor(value) : 3));

const computeFloatingDialogPos = (
  anchorX: number,
  anchorY: number,
  width: number,
  height: number,
): { top: number; left: number } => {
  const padding = 12;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const left = Math.max(
    padding,
    Math.min(anchorX + 8, Math.max(padding, vw - width - padding)),
  );
  const top = Math.max(
    padding,
    Math.min(anchorY + 8, Math.max(padding, vh - height - padding)),
  );

  return { top, left };
};

const selectAdjacentCellsForMerge = (editor: Editor): boolean => {
  const { state, view } = editor;
  const { $from } = state.selection;

  let tableNode: ProseMirrorNode | null = null;
  let tablePos = -1;
  let cellPos = -1;

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (cellPos < 0 && (node.type.name === "tableCell" || node.type.name === "tableHeader")) {
      cellPos = $from.before(depth);
    }
    if (node.type.name === "table") {
      tableNode = node;
      tablePos = $from.before(depth);
      break;
    }
  }

  if (!tableNode || tablePos < 0 || cellPos < 0) {
    return false;
  }

  const tableStart = tablePos + 1;
  const map = TableMap.get(tableNode);
  const relativeCellPos = cellPos - tableStart;
  const currentIndex = map.map.indexOf(relativeCellPos);
  if (currentIndex < 0) {
    return false;
  }

  const row = Math.floor(currentIndex / map.width);
  const col = currentIndex % map.width;
  const candidates: Array<[number, number]> = [];

  if (col + 1 < map.width) {
    candidates.push([row, col + 1]);
  }
  if (col - 1 >= 0) {
    candidates.push([row, col - 1]);
  }
  if (row + 1 < map.height) {
    candidates.push([row + 1, col]);
  }
  if (row - 1 >= 0) {
    candidates.push([row - 1, col]);
  }

  const anchorPos = tableStart + map.positionAt(row, col, tableNode);
  const next = candidates[0];
  if (!next) {
    return false;
  }

  const headPos = tableStart + map.positionAt(next[0], next[1], tableNode);
  const $anchor = state.doc.resolve(anchorPos);
  const $head = state.doc.resolve(headPos);
  const selection = new CellSelection($anchor, $head);
  const tr = state.tr.setSelection(selection);
  view.dispatch(tr);

  return true;
};

export const EditorContextMenu = ({
  editor,
  children,
}: EditorContextMenuProps) => {
  const [menuState, setMenuState] = useState<MenuState>({
    mode: "normal",
    referencePos: null,
    linkHref: null,
    clientX: null,
    clientY: null,
  });
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkInputValue, setLinkInputValue] = useState("https://");
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [tableRowsInput, setTableRowsInput] = useState("3");
  const [tableColsInput, setTableColsInput] = useState("3");
  const [linkSelectionSnapshot, setLinkSelectionSnapshot] = useState<{
    from: number;
    to: number;
  } | null>(null);
  const linkInputRef = useRef<HTMLInputElement | null>(null);
  const linkDialogRef = useRef<HTMLDivElement | null>(null);
  const tableDialogRef = useRef<HTMLDivElement | null>(null);
  const [dialogPos, setDialogPos] = useState<{ top: number; left: number }>({
    top: 96,
    left: 96,
  });

  const handleContextMenuCapture = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!editor) {
        return;
      }

      const clickPos = editor.view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      })?.pos;

      const referencePos =
        typeof clickPos === "number" ? clickPos : editor.state.selection.from;

      const target = event.target;
      const contextLinkHref =
        target instanceof Element ? target.closest("a")?.getAttribute("href") ?? null : null;

      setMenuState({
        mode: isInsideTableAtPos(editor, referencePos) ? "table" : "normal",
        referencePos,
        linkHref: contextLinkHref,
        clientX: event.clientX,
        clientY: event.clientY,
      });
    },
    [editor],
  );

  const activeBlock = useMemo(() => {
    if (!editor) {
      return null;
    }
    return findActiveBlock(editor, menuState.referencePos);
  }, [editor, menuState.referencePos]);

  const getCurrentBlock = useCallback(() => {
    if (!editor) {
      return null;
    }
    return findActiveBlock(editor, null);
  }, [editor]);

  const supportsUnderline = useMemo(
    () => Boolean(editor?.schema?.marks?.underline),
    [editor],
  );

  const isSelectionEmpty = editor?.state.selection.empty ?? true;
  const isTableMode = menuState.mode === "table";
  const activeLinkHref = (editor?.getAttributes("link")?.href as string | undefined) ?? null;
  const effectiveLinkHref = menuState.linkHref || activeLinkHref;
  const canEditLink = !isSelectionEmpty || Boolean(effectiveLinkHref);
  const renderShortcut = (combo?: string) =>
    combo ? <span className={SHORTCUT_CLASS}>{formatShortcut(combo)}</span> : null;

  const withReferenceSelection = useCallback(
    (
      action: () => void,
      options?: {
        preserveCellSelection?: boolean;
      },
    ) => {
      if (!editor) {
        return;
      }

      const isCellSelection = editor.state.selection.constructor.name === "CellSelection";
      if (options?.preserveCellSelection && isCellSelection) {
        editor.commands.focus();
        action();
        return;
      }

      const fallbackPos = editor.state.selection.from;
      const maxPos = editor.state.doc.content.size;
      const rawPos =
        typeof menuState.referencePos === "number"
          ? menuState.referencePos
          : fallbackPos;
      const safePos = Math.max(1, Math.min(rawPos, maxPos));
      const resolved = editor.state.doc.resolve(safePos);
      const nextSelection = TextSelection.near(resolved, 1);
      const tr = editor.state.tr.setSelection(nextSelection);
      editor.view.dispatch(tr);
      editor.commands.focus();
      action();
    },
    [editor, menuState.referencePos],
  );

  const runWithReferenceSelection = useCallback(
    (action: () => void) => () => {
      withReferenceSelection(action);
    },
    [withReferenceSelection],
  );

  const insertNodeBelowBlock = useCallback(
    (node: ProseMirrorNode) => {
      if (!editor) {
        return;
      }

      const fallbackPos = editor.state.selection.from;
      const maxPos = editor.state.doc.content.size;
      const rawRefPos =
        typeof menuState.referencePos === "number"
          ? menuState.referencePos
          : fallbackPos;
      const safeRefPos = Math.max(1, Math.min(rawRefPos, maxPos));

      let insertPos = safeRefPos;
      if (activeBlock) {
        insertPos = activeBlock.pos + activeBlock.nodeSize;
      } else {
        const $pos = editor.state.doc.resolve(safeRefPos);
        for (let depth = $pos.depth; depth > 0; depth -= 1) {
          const candidate = $pos.node(depth);
          if (!candidate.isBlock) {
            continue;
          }
          insertPos = $pos.before(depth) + candidate.nodeSize;
          break;
        }
      }

      let tr = editor.state.tr.insert(insertPos, node);
      const cursorPos = Math.max(1, Math.min(insertPos + 1, tr.doc.content.size));
      tr = tr.setSelection(TextSelection.near(tr.doc.resolve(cursorPos), 1));
      editor.view.dispatch(tr.scrollIntoView());
      editor.commands.focus();
    },
    [activeBlock, editor, menuState.referencePos],
  );

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleUnderline = useCallback(() => {
    if (!editor || !supportsUnderline) {
      return;
    }

    editor.chain().focus().toggleMark("underline").run();
  }, [editor, supportsUnderline]);

  const toggleStrike = useCallback(() => {
    editor?.chain().focus().toggleStrike().run();
  }, [editor]);

  const toggleInlineCode = useCallback(() => {
    editor?.chain().focus().toggleCode().run();
  }, [editor]);

  const toggleHighlight = useCallback(() => {
    editor?.chain().focus().toggleHighlight().run();
  }, [editor]);

  const toggleSubscript = useCallback(() => {
    editor?.chain().focus().toggleSubscript().run();
  }, [editor]);

  const toggleSuperscript = useCallback(() => {
    editor?.chain().focus().toggleSuperscript().run();
  }, [editor]);

  const openLinkEditor = useCallback(() => {
    if (!editor) {
      return;
    }

    const selection = editor.state.selection;
    const fallback = menuState.linkHref ?? (editor.getAttributes("link")?.href as string | undefined) ?? "https://";
    const maxPos = editor.state.doc.content.size;
    const hasContextLink = Boolean(menuState.linkHref) && typeof menuState.referencePos === "number";
    const contextPos = hasContextLink
      ? Math.max(1, Math.min(menuState.referencePos as number, maxPos))
      : selection.from;
    const snapshot = hasContextLink && selection.empty
      ? {
          from: contextPos,
          to: Math.min(contextPos + 1, maxPos),
        }
      : {
          from: selection.from,
          to: selection.to,
        };

    setLinkInputValue(fallback);
    setLinkSelectionSnapshot(snapshot);
    const anchorX = menuState.clientX;
    const anchorY = menuState.clientY;
    if (typeof anchorX === "number" && typeof anchorY === "number") {
      setDialogPos(computeFloatingDialogPos(anchorX, anchorY, 420, 190));
    } else {
      const coords = editor.view.coordsAtPos(selection.from);
      setDialogPos(computeFloatingDialogPos(coords.left, coords.bottom, 420, 190));
    }
    setLinkDialogOpen(true);
  }, [editor, menuState.clientX, menuState.clientY, menuState.linkHref, menuState.referencePos]);

  const clearFormat = useCallback(() => {
    if (!editor || editor.state.selection.empty) {
      return;
    }

    const { from, to } = editor.state.selection;
    const $from = editor.state.doc.resolve(from);
    const $to = editor.state.doc.resolve(to);

    if ($from.sameParent($to) && $from.parent.isTextblock) {
      const selectedText = editor.state.doc.textBetween(from, to, "\n", "\n");
      const plainText = clearFootnoteSyntax(selectedText);
      if (plainText !== selectedText) {
        let tr = editor.state.tr.insertText(plainText, from, to);
        tr = tr.setSelection(
          TextSelection.create(tr.doc, from, from + plainText.length),
        );
        editor.view.dispatch(tr);
      }
    }

    editor.chain().focus().unsetAllMarks().run();
  }, [editor]);

  const setHeading = useCallback(
    (level: 1 | 2 | 3 | 4 | 5 | 6) => () => {
      editor?.chain().focus().toggleHeading({ level }).run();
    },
    [editor],
  );

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run();
  }, [editor]);

  const toggleTaskList = useCallback(() => {
    editor?.chain().focus().toggleTaskList().run();
  }, [editor]);

  const insertQuoteBelow = useCallback(() => {
    if (!editor) {
      return;
    }

    const paragraphNode = editor.state.schema.nodes.paragraph?.create();
    const blockquoteNode = editor.state.schema.nodes.blockquote;
    if (!paragraphNode || !blockquoteNode) {
      return;
    }

    insertNodeBelowBlock(blockquoteNode.create(null, paragraphNode));
  }, [editor, insertNodeBelowBlock]);

  const insertCodeBlockBelow = useCallback(() => {
    if (!editor) {
      return;
    }

    const codeBlockNode = editor.state.schema.nodes.codeBlock;
    if (!codeBlockNode) {
      return;
    }

    insertNodeBelowBlock(codeBlockNode.create());
  }, [editor, insertNodeBelowBlock]);

  const insertMathBlock = useCallback(() => {
    if (!editor) {
      return;
    }

    const selection = editor.state.selection;
    const selectedText = selection.empty
      ? ""
      : editor.state.doc.textBetween(selection.from, selection.to, "\n", "\n");
    const latex = selectedText.trim() || "\\int_0^1 x^2 dx";
    editor.chain().focus().insertBlockMath({ latex }).run();
  }, [editor]);

  const insertFootnote = useCallback(() => {
    if (!editor) {
      return;
    }

    const key = getNextFootnoteKey(editor);
    const definitionPrefix = `[^${key}]: `;
    const { state, view } = editor;
    const { $from } = state.selection;
    const paragraphNode = state.schema.nodes.paragraph;
    if (!paragraphNode) {
      return;
    }

    if ($from.parent.type.name === "paragraph" && $from.parent.textContent.trim().length === 0) {
      const from = $from.start();
      const to = $from.end();
      let tr = state.tr.insertText(definitionPrefix, from, to);
      const keyFrom = from + 2;
      const keyTo = keyFrom + key.length;
      tr = tr.setSelection(TextSelection.create(tr.doc, keyFrom, keyTo));
      view.dispatch(tr.scrollIntoView());
      editor.commands.focus();
      return;
    }

    const currentBlock = getCurrentBlock();
    const insertPos = currentBlock
      ? currentBlock.pos + currentBlock.nodeSize
      : state.selection.to;
    const definitionText = state.schema.text(definitionPrefix);
    const paragraph = paragraphNode.create(null, definitionText);

    let tr = state.tr.insert(insertPos, paragraph);
    const keyFrom = insertPos + 1 + 2;
    const keyTo = keyFrom + key.length;
    tr = tr.setSelection(
      TextSelection.create(tr.doc, keyFrom, keyTo),
    );
    view.dispatch(tr.scrollIntoView());
    editor.commands.focus();
  }, [editor, getCurrentBlock]);

  const openTableDialog = useCallback(() => {
    if (!editor) {
      return;
    }

    setTableRowsInput("3");
    setTableColsInput("3");
    const selection = editor.state.selection;
    const anchorX = menuState.clientX;
    const anchorY = menuState.clientY;
    if (typeof anchorX === "number" && typeof anchorY === "number") {
      setDialogPos(computeFloatingDialogPos(anchorX, anchorY, 320, 220));
    } else {
      const coords = editor.view.coordsAtPos(selection.from);
      setDialogPos(computeFloatingDialogPos(coords.left, coords.bottom, 320, 220));
    }
    setTableDialogOpen(true);
  }, [editor, menuState.clientX, menuState.clientY]);

  const insertImage = useCallback(() => {
    const run = async () => {
      if (!editor) {
        return;
      }

      const file = await pickImageFile();
      if (!file) {
        return;
      }

      try {
        const src = await readFileAsDataUrl(file);
        editor
          .chain()
          .focus()
          .setImage({
            src,
            alt: file.name || "image",
            title: file.name || undefined,
          })
          .run();
      } catch {
        showToast("图片读取失败，请重试");
      }
    };

    void run();
  }, [editor]);

  const insertHorizontalRule = useCallback(() => {
    editor?.chain().focus().setHorizontalRule().run();
  }, [editor]);

  const applyLinkFromDialog = useCallback(() => {
    if (!editor) {
      return;
    }

    if (linkSelectionSnapshot) {
      const maxPos = editor.state.doc.content.size;
      const from = Math.max(1, Math.min(linkSelectionSnapshot.from, maxPos));
      const to = Math.max(from, Math.min(linkSelectionSnapshot.to, maxPos));
      const tr = editor.state.tr.setSelection(TextSelection.create(editor.state.doc, from, to));
      editor.view.dispatch(tr);
    }

    const href = normalizeUrl(linkInputValue);
    if (!href) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkDialogOpen(false);
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setLinkDialogOpen(false);
  }, [editor, linkInputValue, linkSelectionSnapshot]);

  const applyTableFromDialog = useCallback(() => {
    if (!editor) {
      return;
    }

    const rowRaw = tableRowsInput.trim();
    const colRaw = tableColsInput.trim();
    if (!/^\d+$/.test(rowRaw) || !/^\d+$/.test(colRaw)) {
      showToast("请输入有效的行数和列数");
      return;
    }
    const rows = clampTableSize(Number(rowRaw));
    const cols = clampTableSize(Number(colRaw));

    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();

    setTableDialogOpen(false);
  }, [editor, tableColsInput, tableRowsInput]);

  useEffect(() => {
    if (!linkDialogOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      linkInputRef.current?.focus();
      linkInputRef.current?.select();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [linkDialogOpen]);

  useEffect(() => {
    if (!linkDialogOpen && !tableDialogOpen) {
      return;
    }

    const onPointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (linkDialogOpen && linkDialogRef.current?.contains(target)) {
        return;
      }
      if (tableDialogOpen && tableDialogRef.current?.contains(target)) {
        return;
      }

      setLinkDialogOpen(false);
      setTableDialogOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown, true);
    };
  }, [linkDialogOpen, tableDialogOpen]);

  const insertParagraphAbove = useCallback(() => {
    if (!editor || !activeBlock) {
      return;
    }

    const paragraphNode = editor.state.schema.nodes.paragraph?.create();
    if (!paragraphNode) {
      return;
    }

    let tr = editor.state.tr.insert(activeBlock.pos, paragraphNode);
    tr = tr.setSelection(TextSelection.create(tr.doc, activeBlock.pos + 1));
    editor.view.dispatch(tr.scrollIntoView());
    editor.commands.focus();
  }, [activeBlock, editor]);

  const insertParagraphBelow = useCallback(() => {
    if (!editor || !activeBlock) {
      return;
    }

    const paragraphNode = editor.state.schema.nodes.paragraph?.create();
    if (!paragraphNode) {
      return;
    }

    const insertPos = activeBlock.pos + activeBlock.nodeSize;
    let tr = editor.state.tr.insert(insertPos, paragraphNode);
    tr = tr.setSelection(TextSelection.create(tr.doc, insertPos + 1));
    editor.view.dispatch(tr.scrollIntoView());
    editor.commands.focus();
  }, [activeBlock, editor]);

  const insertParagraphAboveCurrent = useCallback(() => {
    if (!editor) {
      return;
    }

    const currentBlock = getCurrentBlock();
    if (!currentBlock) {
      return;
    }

    const paragraphNode = editor.state.schema.nodes.paragraph?.create();
    if (!paragraphNode) {
      return;
    }

    let tr = editor.state.tr.insert(currentBlock.pos, paragraphNode);
    tr = tr.setSelection(TextSelection.create(tr.doc, currentBlock.pos + 1));
    editor.view.dispatch(tr.scrollIntoView());
    editor.commands.focus();
  }, [editor, getCurrentBlock]);

  const insertParagraphBelowCurrent = useCallback(() => {
    if (!editor) {
      return;
    }

    const currentBlock = getCurrentBlock();
    if (!currentBlock) {
      return;
    }

    const paragraphNode = editor.state.schema.nodes.paragraph?.create();
    if (!paragraphNode) {
      return;
    }

    const insertPos = currentBlock.pos + currentBlock.nodeSize;
    let tr = editor.state.tr.insert(insertPos, paragraphNode);
    tr = tr.setSelection(TextSelection.create(tr.doc, insertPos + 1));
    editor.view.dispatch(tr.scrollIntoView());
    editor.commands.focus();
  }, [editor, getCurrentBlock]);

  const copyContent = useCallback(async () => {
    if (!editor) {
      return;
    }

    const selection = editor.state.selection;
    let text = "";

    if (!selection.empty) {
      text = editor.state.doc.textBetween(selection.from, selection.to, "\n", "\n");
    } else if (activeBlock) {
      text = editor.state.doc.textBetween(
        activeBlock.pos,
        activeBlock.pos + activeBlock.nodeSize,
        "\n",
        "\n",
      );
    }

    if (!text.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      showToast("复制成功");
    } catch {
      if (copyTextLegacy(text)) {
        showToast("复制成功");
        return;
      }
      showToast("复制失败，请使用 Ctrl+C");
    }
  }, [activeBlock, editor]);

  const pasteFromClipboard = useCallback(async () => {
    if (!editor) {
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        return;
      }
      editor.chain().focus().insertContent(text).run();
    } catch {
      showToast("浏览器限制读取剪贴板，请使用 Ctrl+V");
    }
  }, [editor]);

  const deleteSelectionContent = useCallback(() => {
    if (!editor || editor.state.selection.empty) {
      return;
    }
    editor.chain().focus().deleteSelection().run();
  }, [editor]);

  const clearParagraphFormat = useCallback(() => {
    if (!editor || !activeBlock) {
      return;
    }

    const anchor = Math.min(activeBlock.pos + 1, editor.state.doc.content.size);
    const tr = editor.state.tr.setSelection(
      TextSelection.create(editor.state.doc, anchor),
    );
    editor.view.dispatch(tr);
    editor.commands.focus();

    const { $from } = editor.state.selection;
    if ($from.parent.isTextblock) {
      const from = $from.start();
      const to = $from.end();
      const source = editor.state.doc.textBetween(from, to, "\n", "\n");
      const plain = clearFootnoteSyntax(source);
      if (plain !== source) {
        let replaceTr = editor.state.tr.insertText(plain, from, to);
        const nextPos = Math.max(
          1,
          Math.min(from + plain.length, replaceTr.doc.content.size),
        );
        replaceTr = replaceTr.setSelection(TextSelection.create(replaceTr.doc, nextPos));
        editor.view.dispatch(replaceTr);
      }
    }

    editor.chain().focus().unsetAllMarks().run();

    if (editor.isActive("taskItem") || editor.isActive("listItem")) {
      liftOutOfAllLists(editor);
      if (
        (editor.isActive("taskItem") || editor.isActive("listItem")) &&
        convertCurrentListItemToParagraph(editor)
      ) {
        return;
      }
    }

    editor.chain().focus().clearNodes().run();
  }, [activeBlock, editor]);

  const deleteBlock = useCallback(() => {
    if (!editor || !activeBlock) {
      return;
    }

    const paragraphNode = editor.state.schema.nodes.paragraph?.create();
    let tr = editor.state.tr;

    if (activeBlock.type === "codeBlock" && paragraphNode) {
      tr = tr.replaceWith(
        activeBlock.pos,
        activeBlock.pos + activeBlock.nodeSize,
        paragraphNode,
      );
      tr = tr.setSelection(TextSelection.create(tr.doc, activeBlock.pos + 1));
    } else {
      tr = tr.delete(activeBlock.pos, activeBlock.pos + activeBlock.nodeSize);
    }

    editor.view.dispatch(tr);
    editor.commands.focus();
  }, [activeBlock, editor]);

  const deleteCurrentBlock = useCallback(() => {
    if (!editor) {
      return;
    }

    const currentBlock = getCurrentBlock();
    if (!currentBlock) {
      return;
    }

    const paragraphNode = editor.state.schema.nodes.paragraph?.create();
    let tr = editor.state.tr;

    if (currentBlock.type === "codeBlock" && paragraphNode) {
      tr = tr.replaceWith(
        currentBlock.pos,
        currentBlock.pos + currentBlock.nodeSize,
        paragraphNode,
      );
      tr = tr.setSelection(TextSelection.create(tr.doc, currentBlock.pos + 1));
    } else {
      tr = tr.delete(currentBlock.pos, currentBlock.pos + currentBlock.nodeSize);
    }

    editor.view.dispatch(tr);
    editor.commands.focus();
  }, [editor, getCurrentBlock]);

  const clearCurrentParagraphFormat = useCallback(() => {
    if (!editor) {
      return;
    }

    const currentBlock = getCurrentBlock();
    if (!currentBlock) {
      return;
    }

    const anchor = Math.min(currentBlock.pos + 1, editor.state.doc.content.size);
    const tr = editor.state.tr.setSelection(
      TextSelection.create(editor.state.doc, anchor),
    );
    editor.view.dispatch(tr);
    editor.commands.focus();

    const { $from } = editor.state.selection;
    if ($from.parent.isTextblock) {
      const from = $from.start();
      const to = $from.end();
      const source = editor.state.doc.textBetween(from, to, "\n", "\n");
      const plain = clearFootnoteSyntax(source);
      if (plain !== source) {
        let replaceTr = editor.state.tr.insertText(plain, from, to);
        const nextPos = Math.max(
          1,
          Math.min(from + plain.length, replaceTr.doc.content.size),
        );
        replaceTr = replaceTr.setSelection(TextSelection.create(replaceTr.doc, nextPos));
        editor.view.dispatch(replaceTr);
      }
    }

    editor.chain().focus().unsetAllMarks().run();

    if (editor.isActive("taskItem") || editor.isActive("listItem")) {
      liftOutOfAllLists(editor);
      if (
        (editor.isActive("taskItem") || editor.isActive("listItem")) &&
        convertCurrentListItemToParagraph(editor)
      ) {
        return;
      }
    }

    editor.chain().focus().clearNodes().run();
  }, [editor, getCurrentBlock]);

  const addColumnBefore = useCallback(() => {
    withReferenceSelection(() => {
      editor?.chain().focus().addColumnBefore().run();
    });
  }, [editor, withReferenceSelection]);

  const addColumnAfter = useCallback(() => {
    withReferenceSelection(() => {
      editor?.chain().focus().addColumnAfter().run();
    });
  }, [editor, withReferenceSelection]);

  const deleteColumn = useCallback(() => {
    withReferenceSelection(() => {
      editor?.chain().focus().deleteColumn().run();
    });
  }, [editor, withReferenceSelection]);

  const addRowBefore = useCallback(() => {
    withReferenceSelection(() => {
      editor?.chain().focus().addRowBefore().run();
    });
  }, [editor, withReferenceSelection]);

  const addRowAfter = useCallback(() => {
    withReferenceSelection(() => {
      editor?.chain().focus().addRowAfter().run();
    });
  }, [editor, withReferenceSelection]);

  const deleteRow = useCallback(() => {
    withReferenceSelection(() => {
      editor?.chain().focus().deleteRow().run();
    });
  }, [editor, withReferenceSelection]);

  const mergeCells = useCallback(() => {
    withReferenceSelection(
      () => {
        if (!editor) {
          return;
        }

        if (editor.can().mergeCells()) {
          editor.chain().focus().mergeCells().run();
          return;
        }

        if (selectAdjacentCellsForMerge(editor) && editor.can().mergeCells()) {
          editor.chain().focus().mergeCells().run();
          return;
        }

        if (editor.can().splitCell()) {
          editor.chain().focus().splitCell().run();
          return;
        }

        showToast("请先选中可合并的相邻单元格");
      },
      { preserveCellSelection: true },
    );
  }, [editor, withReferenceSelection]);

  const deleteTable = useCallback(() => {
    withReferenceSelection(() => {
      editor?.chain().focus().deleteTable().run();
    });
  }, [editor, withReferenceSelection]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const runIfEnabled = (
      event: KeyboardEvent,
      combo: string,
      run: () => void,
      enabled?: () => boolean,
    ): boolean => {
      if (!matchShortcut(event, combo)) {
        return false;
      }
      if (enabled && !enabled()) {
        return true;
      }
      event.preventDefault();
      run();
      return true;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const insideEditor =
        activeElement instanceof Node && editor.view.dom.contains(activeElement);
      if ((!editor.isFocused && !insideEditor) || !editor.isEditable || event.isComposing) {
        return;
      }

      const selectionEmpty = editor.state.selection.empty;
      const isLinkPlusShortcut =
        (IS_MAC ? event.metaKey : event.ctrlKey) &&
        !event.altKey &&
        (event.key === "+" || (event.key === "=" && event.shiftKey));
      if (isLinkPlusShortcut) {
        event.preventDefault();
        openLinkEditor();
        return;
      }

      if (runIfEnabled(event, "Mod+B", toggleBold)) return;
      if (runIfEnabled(event, "Mod+I", toggleItalic)) return;
      if (runIfEnabled(event, "Mod+K", openLinkEditor)) return;
      if (runIfEnabled(event, "Mod+Shift+K", openLinkEditor)) return;
      if (runIfEnabled(event, "Mod+Shift+H", toggleHighlight)) return;
      if (runIfEnabled(event, "Mod+U", toggleUnderline)) return;
      if (runIfEnabled(event, "Mod+Shift+X", toggleStrike)) return;
      if (runIfEnabled(event, "Mod+E", toggleInlineCode)) return;
      if (runIfEnabled(event, "Mod+,", toggleSubscript)) return;
      if (runIfEnabled(event, "Mod+.", toggleSuperscript)) return;

      if (runIfEnabled(event, "Mod+Alt+C", insertCodeBlockBelow)) return;
      if (runIfEnabled(event, "Mod+Shift+.", insertQuoteBelow)) return;
      if (runIfEnabled(event, "Mod+Shift+F", insertFootnote)) return;
      if (runIfEnabled(event, "Mod+Alt+T", openTableDialog)) return;
      if (runIfEnabled(event, "Mod+Alt+I", insertImage)) return;

      if (runIfEnabled(event, "Mod+C", () => void copyContent(), () => !selectionEmpty || !!activeBlock)) return;
      if (runIfEnabled(event, "Mod+V", () => void pasteFromClipboard())) return;
      if (runIfEnabled(event, "Backspace", deleteSelectionContent, () => !selectionEmpty)) return;
      if (runIfEnabled(event, "Mod+Shift+Backspace", deleteCurrentBlock, () => !!getCurrentBlock())) return;
      if (runIfEnabled(event, "Mod+\\", clearFormat, () => !selectionEmpty)) return;
      if (runIfEnabled(event, "Mod+Shift+\\", clearCurrentParagraphFormat, () => !!getCurrentBlock())) return;

      if (runIfEnabled(event, "Mod+Alt+1", runWithReferenceSelection(setHeading(1)))) return;
      if (runIfEnabled(event, "Mod+Alt+2", runWithReferenceSelection(setHeading(2)))) return;
      if (runIfEnabled(event, "Mod+Alt+3", runWithReferenceSelection(setHeading(3)))) return;
      if (runIfEnabled(event, "Mod+Alt+4", runWithReferenceSelection(setHeading(4)))) return;
      if (runIfEnabled(event, "Mod+Alt+5", runWithReferenceSelection(setHeading(5)))) return;
      if (runIfEnabled(event, "Mod+Alt+6", runWithReferenceSelection(setHeading(6)))) return;

      if (runIfEnabled(event, "Mod+Shift+8", runWithReferenceSelection(toggleBulletList))) return;
      if (runIfEnabled(event, "Mod+Shift+7", runWithReferenceSelection(toggleOrderedList))) return;
      if (runIfEnabled(event, "Mod+Shift+9", runWithReferenceSelection(toggleTaskList))) return;
      if (runIfEnabled(event, "Mod+Shift+M", runWithReferenceSelection(insertMathBlock))) return;
      if (runIfEnabled(event, "Mod+Shift+-", runWithReferenceSelection(insertHorizontalRule))) return;
      if (runIfEnabled(event, "Alt+ArrowUp", insertParagraphAboveCurrent, () => !!getCurrentBlock())) return;
      runIfEnabled(event, "Alt+ArrowDown", insertParagraphBelowCurrent, () => !!getCurrentBlock());
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [
    activeBlock,
    clearFormat,
    clearCurrentParagraphFormat,
    clearParagraphFormat,
    copyContent,
    deleteBlock,
    deleteCurrentBlock,
    deleteSelectionContent,
    editor,
    getCurrentBlock,
    insertCodeBlockBelow,
    insertFootnote,
    insertHorizontalRule,
    insertImage,
    insertMathBlock,
    insertParagraphAbove,
    insertParagraphAboveCurrent,
    insertParagraphBelow,
    insertParagraphBelowCurrent,
    insertQuoteBelow,
    openTableDialog,
    pasteFromClipboard,
    runWithReferenceSelection,
    setHeading,
    openLinkEditor,
    toggleBold,
    toggleBulletList,
    toggleHighlight,
    toggleInlineCode,
    toggleItalic,
    toggleOrderedList,
    toggleStrike,
    toggleSubscript,
    toggleSuperscript,
    toggleTaskList,
    toggleUnderline,
  ]);

  const renderTableOperations = () => (
    <>
      <ContextMenu.Label className={LABEL_CLASS}>表格操作</ContextMenu.Label>

      <ContextMenu.Item className={ITEM_CLASS} onSelect={addColumnBefore}>
        <span className={LEADING_CLASS}>
          <Plus className={ICON_CLASS} />
          <span>插入左侧列</span>
        </span>
      </ContextMenu.Item>

      <ContextMenu.Item className={ITEM_CLASS} onSelect={addColumnAfter}>
        <span className={LEADING_CLASS}>
          <Plus className={ICON_CLASS} />
          <span>右侧插入列</span>
        </span>
      </ContextMenu.Item>

      <ContextMenu.Item className={ITEM_CLASS} onSelect={deleteColumn}>
        <span className={LEADING_CLASS}>
          <Minus className={ICON_CLASS} />
          <span>删除列</span>
        </span>
      </ContextMenu.Item>

      <ContextMenu.Separator className={SEPARATOR_CLASS} />

      <ContextMenu.Item className={ITEM_CLASS} onSelect={addRowBefore}>
        <span className={LEADING_CLASS}>
          <Plus className={ICON_CLASS} />
          <span>插入上排</span>
        </span>
      </ContextMenu.Item>

      <ContextMenu.Item className={ITEM_CLASS} onSelect={addRowAfter}>
        <span className={LEADING_CLASS}>
          <Plus className={ICON_CLASS} />
          <span>插入下方一行</span>
        </span>
      </ContextMenu.Item>

      <ContextMenu.Item className={ITEM_CLASS} onSelect={deleteRow}>
        <span className={LEADING_CLASS}>
          <Minus className={ICON_CLASS} />
          <span>删除行</span>
        </span>
      </ContextMenu.Item>

      <ContextMenu.Item className={ITEM_CLASS} onSelect={mergeCells}>
        <span className={LEADING_CLASS}>
          <Table className={ICON_CLASS} />
          <span>合并/拆分单元格</span>
        </span>
      </ContextMenu.Item>

      <ContextMenu.Item className={DANGER_ITEM_CLASS} onSelect={deleteTable}>
        <span className={LEADING_CLASS}>
          <Trash2 className={`${ICON_CLASS} hm-context-menu-icon-danger`} />
          <span>删除表格</span>
        </span>
      </ContextMenu.Item>
    </>
  );

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div onContextMenuCapture={handleContextMenuCapture}>{children}</div>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content className={CONTENT_CLASS}>
          {isTableMode ? (
            <>{renderTableOperations()}</>
          ) : (
            <>
              <ContextMenu.Item
                className={ITEM_CLASS}
                onSelect={toggleBold}
                disabled={isSelectionEmpty}
              >
                <span className={LEADING_CLASS}>
                  <Bold className={ICON_CLASS} />
                  <span>加粗</span>
                </span>
                {renderShortcut("Mod+B")}
              </ContextMenu.Item>
              <ContextMenu.Item
                className={ITEM_CLASS}
                onSelect={toggleItalic}
                disabled={isSelectionEmpty}
              >
                <span className={LEADING_CLASS}>
                  <Italic className={ICON_CLASS} />
                  <span>斜体</span>
                </span>
                {renderShortcut("Mod+I")}
              </ContextMenu.Item>
              <ContextMenu.Item
                className={ITEM_CLASS}
                onSelect={openLinkEditor}
                disabled={!canEditLink}
              >
                <span className={LEADING_CLASS}>
                  <Link className={ICON_CLASS} />
                  <span>链接</span>
                </span>
                <span className={SHORTCUT_CLASS}>
                  {`${formatShortcut("Mod+K")} / ${formatShortcut("Mod+Shift+K")}`}
                </span>
              </ContextMenu.Item>
              <ContextMenu.Item
                className={ITEM_CLASS}
                onSelect={toggleHighlight}
                disabled={isSelectionEmpty}
              >
                <span className={LEADING_CLASS}>
                  <Highlighter className={ICON_CLASS} />
                  <span>高亮</span>
                </span>
                {renderShortcut("Mod+Shift+H")}
              </ContextMenu.Item>
              <ContextMenu.Item className={ITEM_CLASS} onSelect={insertCodeBlockBelow}>
                <span className={LEADING_CLASS}>
                  <Code2 className={ICON_CLASS} />
                  <span>代码块</span>
                </span>
                {renderShortcut("Mod+Alt+C")}
              </ContextMenu.Item>
              <ContextMenu.Item className={ITEM_CLASS} onSelect={insertQuoteBelow}>
                <span className={LEADING_CLASS}>
                  <Quote className={ICON_CLASS} />
                  <span>引用</span>
                </span>
                {renderShortcut("Mod+Shift+.")}
              </ContextMenu.Item>
              <ContextMenu.Item className={ITEM_CLASS} onSelect={openTableDialog}>
                <span className={LEADING_CLASS}>
                  <Table className={ICON_CLASS} />
                  <span>插入表格</span>
                </span>
                {renderShortcut("Mod+Alt+T")}
              </ContextMenu.Item>
              <ContextMenu.Item className={ITEM_CLASS} onSelect={insertImage}>
                <span className={LEADING_CLASS}>
                  <Image className={ICON_CLASS} />
                  <span>插入图像</span>
                </span>
                {renderShortcut("Mod+Alt+I")}
              </ContextMenu.Item>
              <ContextMenu.Item
                className={ITEM_CLASS}
                onSelect={() => {
                  void copyContent();
                }}
                disabled={!activeBlock && isSelectionEmpty}
              >
                <span className={LEADING_CLASS}>
                  <Copy className={ICON_CLASS} />
                  <span>复制</span>
                </span>
                {renderShortcut("Mod+C")}
              </ContextMenu.Item>
              <ContextMenu.Item
                className={ITEM_CLASS}
                onSelect={() => {
                  void pasteFromClipboard();
                }}
              >
                <span className={LEADING_CLASS}>
                  <ClipboardPaste className={ICON_CLASS} />
                  <span>粘贴</span>
                </span>
                {renderShortcut("Mod+V")}
              </ContextMenu.Item>
              <ContextMenu.Item
                className={ITEM_CLASS}
                onSelect={deleteSelectionContent}
                disabled={isSelectionEmpty}
              >
                <span className={LEADING_CLASS}>
                  <Trash2 className={ICON_CLASS} />
                  <span>删除选中</span>
                </span>
                {renderShortcut("Backspace")}
              </ContextMenu.Item>
              <ContextMenu.Item
                className={DANGER_ITEM_CLASS}
                onSelect={deleteBlock}
                disabled={!activeBlock}
              >
                <span className={LEADING_CLASS}>
                  <Trash2 className={`${ICON_CLASS} hm-context-menu-icon-danger`} />
                  <span>删除整段</span>
                </span>
                {renderShortcut("Mod+Shift+Backspace")}
              </ContextMenu.Item>
              <ContextMenu.Item
                className={ITEM_CLASS}
                onSelect={clearFormat}
                disabled={isSelectionEmpty}
              >
                <span className={LEADING_CLASS}>
                  <RemoveFormatting className={ICON_CLASS} />
                  <span>清除选中样式</span>
                </span>
                {renderShortcut("Mod+\\")}
              </ContextMenu.Item>
              <ContextMenu.Item
                className={ITEM_CLASS}
                onSelect={clearParagraphFormat}
                disabled={!activeBlock}
              >
                <span className={LEADING_CLASS}>
                  <RemoveFormatting className={ICON_CLASS} />
                  <span>清除整段样式</span>
                </span>
                {renderShortcut("Mod+Shift+\\")}
              </ContextMenu.Item>

              <ContextMenu.Separator className={SEPARATOR_CLASS} />

              <ContextMenu.Sub>
                <ContextMenu.SubTrigger className={ITEM_CLASS}>
                  <span className={LEADING_CLASS}>
                    <Code className={ICON_CLASS} />
                    <span>更多格式</span>
                  </span>
                  <ChevronRight className={ICON_CLASS} />
                </ContextMenu.SubTrigger>
                <ContextMenu.Portal>
                  <ContextMenu.SubContent className={CONTENT_CLASS}>
                    <ContextMenu.Item
                      className={ITEM_CLASS}
                      onSelect={toggleUnderline}
                      disabled={!supportsUnderline || isSelectionEmpty}
                    >
                      <span className={LEADING_CLASS}>
                        <Underline className={ICON_CLASS} />
                        <span>下划线</span>
                      </span>
                      {renderShortcut("Mod+U")}
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      className={ITEM_CLASS}
                      onSelect={toggleStrike}
                      disabled={isSelectionEmpty}
                    >
                      <span className={LEADING_CLASS}>
                        <Strikethrough className={ICON_CLASS} />
                        <span>删除线</span>
                      </span>
                      {renderShortcut("Mod+Shift+X")}
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      className={ITEM_CLASS}
                      onSelect={toggleInlineCode}
                      disabled={isSelectionEmpty}
                    >
                      <span className={LEADING_CLASS}>
                        <Code className={ICON_CLASS} />
                        <span>行内代码</span>
                      </span>
                      {renderShortcut("Mod+E")}
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      className={ITEM_CLASS}
                      onSelect={toggleSubscript}
                      disabled={isSelectionEmpty}
                    >
                      <span className={LEADING_CLASS}>
                        <Subscript className={ICON_CLASS} />
                        <span>脚标</span>
                      </span>
                      {renderShortcut("Mod+,")}
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      className={ITEM_CLASS}
                      onSelect={toggleSuperscript}
                      disabled={isSelectionEmpty}
                    >
                      <span className={LEADING_CLASS}>
                        <Superscript className={ICON_CLASS} />
                        <span>上标</span>
                      </span>
                      {renderShortcut("Mod+.")}
                    </ContextMenu.Item>
                  </ContextMenu.SubContent>
                </ContextMenu.Portal>
              </ContextMenu.Sub>

              <ContextMenu.Sub>
                <ContextMenu.SubTrigger className={ITEM_CLASS}>
                  <span className={LEADING_CLASS}>
                    <Heading1 className={ICON_CLASS} />
                    <span>标题</span>
                  </span>
                  <ChevronRight className={ICON_CLASS} />
                </ContextMenu.SubTrigger>
                <ContextMenu.Portal>
                  <ContextMenu.SubContent className={CONTENT_CLASS}>
                    <ContextMenu.Item className={ITEM_CLASS} onSelect={runWithReferenceSelection(setHeading(1))}><span className={LEADING_CLASS}><Heading1 className={ICON_CLASS} /><span>一级标题</span></span>{renderShortcut("Mod+Alt+1")}</ContextMenu.Item>
                    <ContextMenu.Item className={ITEM_CLASS} onSelect={runWithReferenceSelection(setHeading(2))}><span className={LEADING_CLASS}><Heading2 className={ICON_CLASS} /><span>二级标题</span></span>{renderShortcut("Mod+Alt+2")}</ContextMenu.Item>
                    <ContextMenu.Item className={ITEM_CLASS} onSelect={runWithReferenceSelection(setHeading(3))}><span className={LEADING_CLASS}><Heading3 className={ICON_CLASS} /><span>三级标题</span></span>{renderShortcut("Mod+Alt+3")}</ContextMenu.Item>
                    <ContextMenu.Item className={ITEM_CLASS} onSelect={runWithReferenceSelection(setHeading(4))}><span className={LEADING_CLASS}><Heading4 className={ICON_CLASS} /><span>四级标题</span></span>{renderShortcut("Mod+Alt+4")}</ContextMenu.Item>
                    <ContextMenu.Item className={ITEM_CLASS} onSelect={runWithReferenceSelection(setHeading(5))}><span className={LEADING_CLASS}><Heading5 className={ICON_CLASS} /><span>五级标题</span></span>{renderShortcut("Mod+Alt+5")}</ContextMenu.Item>
                    <ContextMenu.Item className={ITEM_CLASS} onSelect={runWithReferenceSelection(setHeading(6))}><span className={LEADING_CLASS}><Heading6 className={ICON_CLASS} /><span>六级标题</span></span>{renderShortcut("Mod+Alt+6")}</ContextMenu.Item>
                  </ContextMenu.SubContent>
                </ContextMenu.Portal>
              </ContextMenu.Sub>

              <ContextMenu.Sub>
                <ContextMenu.SubTrigger className={ITEM_CLASS}>
                  <span className={LEADING_CLASS}>
                    <List className={ICON_CLASS} />
                    <span>列表</span>
                  </span>
                  <ChevronRight className={ICON_CLASS} />
                </ContextMenu.SubTrigger>
                <ContextMenu.Portal>
                  <ContextMenu.SubContent className={CONTENT_CLASS}>
                    <ContextMenu.Item className={ITEM_CLASS} onSelect={runWithReferenceSelection(toggleBulletList)}><span className={LEADING_CLASS}><List className={ICON_CLASS} /><span>无序列表</span></span>{renderShortcut("Mod+Shift+8")}</ContextMenu.Item>
                    <ContextMenu.Item className={ITEM_CLASS} onSelect={runWithReferenceSelection(toggleOrderedList)}><span className={LEADING_CLASS}><ListOrdered className={ICON_CLASS} /><span>有序列表</span></span>{renderShortcut("Mod+Shift+7")}</ContextMenu.Item>
                    <ContextMenu.Item className={ITEM_CLASS} onSelect={runWithReferenceSelection(toggleTaskList)}><span className={LEADING_CLASS}><ListTodo className={ICON_CLASS} /><span>任务列表</span></span>{renderShortcut("Mod+Shift+9")}</ContextMenu.Item>
                  </ContextMenu.SubContent>
                </ContextMenu.Portal>
              </ContextMenu.Sub>

              <ContextMenu.Sub>
                <ContextMenu.SubTrigger className={ITEM_CLASS}>
                  <span className={LEADING_CLASS}>
                    <Plus className={ICON_CLASS} />
                    <span>插入更多</span>
                  </span>
                  <ChevronRight className={ICON_CLASS} />
                </ContextMenu.SubTrigger>
                <ContextMenu.Portal>
                  <ContextMenu.SubContent className={CONTENT_CLASS}>
                    <ContextMenu.Item className={ITEM_CLASS} onSelect={insertFootnote}>
                      <span className={LEADING_CLASS}>
                        <Quote className={ICON_CLASS} />
                        <span>注脚</span>
                      </span>
                      {renderShortcut("Mod+Shift+F")}
                    </ContextMenu.Item>
                    <ContextMenu.Item className={ITEM_CLASS} onSelect={runWithReferenceSelection(insertMathBlock)}><span className={LEADING_CLASS}><Sigma className={ICON_CLASS} /><span>数学公式</span></span>{renderShortcut("Mod+Shift+M")}</ContextMenu.Item>
                    <ContextMenu.Item className={ITEM_CLASS} onSelect={runWithReferenceSelection(insertHorizontalRule)}><span className={LEADING_CLASS}><SeparatorHorizontal className={ICON_CLASS} /><span>分割线</span></span>{renderShortcut("Mod+Shift+-")}</ContextMenu.Item>
                    <ContextMenu.Item className={ITEM_CLASS} onSelect={insertParagraphAbove} disabled={!activeBlock}><span className={LEADING_CLASS}><ArrowUp className={ICON_CLASS} /><span>段落上面</span></span>{renderShortcut("Alt+ArrowUp")}</ContextMenu.Item>
                    <ContextMenu.Item className={ITEM_CLASS} onSelect={insertParagraphBelow} disabled={!activeBlock}><span className={LEADING_CLASS}><ArrowDown className={ICON_CLASS} /><span>段落下面</span></span>{renderShortcut("Alt+ArrowDown")}</ContextMenu.Item>
                  </ContextMenu.SubContent>
                </ContextMenu.Portal>
              </ContextMenu.Sub>
            </>
          )}
        </ContextMenu.Content>
      </ContextMenu.Portal>

      {typeof document !== "undefined" &&
        createPortal(
          <>
            {linkDialogOpen && (
              <div
                ref={linkDialogRef}
                className="hm-editor-dialog hm-editor-dialog-floating"
                role="dialog"
                aria-modal="false"
                aria-label="编辑链接"
                style={{ top: `${dialogPos.top}px`, left: `${dialogPos.left}px` }}
              >
                <div className="hm-editor-dialog-title">编辑链接</div>
                <label className="hm-editor-dialog-field">
                  <span>链接地址：</span>
                  <input
                    ref={linkInputRef}
                    value={linkInputValue}
                    onChange={(event) => setLinkInputValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        applyLinkFromDialog();
                      }
                      if (event.key === "Escape") {
                        event.preventDefault();
                        setLinkDialogOpen(false);
                      }
                    }}
                  />
                </label>
                <div className="hm-editor-dialog-actions">
                  <button
                    type="button"
                    className="hm-editor-dialog-btn hm-editor-dialog-btn-ghost"
                    onClick={() => setLinkDialogOpen(false)}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    className="hm-editor-dialog-btn"
                    onClick={applyLinkFromDialog}
                  >
                    确认
                  </button>
                </div>
              </div>
            )}

            {tableDialogOpen && (
              <div
                ref={tableDialogRef}
                className="hm-editor-dialog hm-editor-dialog-compact hm-editor-dialog-floating"
                role="dialog"
                aria-modal="false"
                aria-label="插入表格"
                style={{ top: `${dialogPos.top}px`, left: `${dialogPos.left}px` }}
              >
                <div className="hm-editor-dialog-title">插入表格</div>
                <label className="hm-editor-dialog-field hm-editor-dialog-field-inline">
                  <span>列数：</span>
                  <input
                    value={tableColsInput}
                    onChange={(event) => setTableColsInput(event.target.value)}
                    inputMode="numeric"
                  />
                </label>
                <label className="hm-editor-dialog-field hm-editor-dialog-field-inline">
                  <span>行数：</span>
                  <input
                    value={tableRowsInput}
                    onChange={(event) => setTableRowsInput(event.target.value)}
                    inputMode="numeric"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        applyTableFromDialog();
                      }
                      if (event.key === "Escape") {
                        event.preventDefault();
                        setTableDialogOpen(false);
                      }
                    }}
                  />
                </label>
                <div className="hm-editor-dialog-actions">
                  <button
                    type="button"
                    className="hm-editor-dialog-btn hm-editor-dialog-btn-ghost"
                    onClick={() => setTableDialogOpen(false)}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    className="hm-editor-dialog-btn"
                    onClick={applyTableFromDialog}
                  >
                    插入
                  </button>
                </div>
              </div>
            )}
          </>,
          document.body,
        )}
    </ContextMenu.Root>
  );
};
