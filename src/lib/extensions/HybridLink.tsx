import { mergeAttributes, Node } from "@tiptap/core";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { NodeSelection } from "@tiptap/pm/state";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { memo, useCallback, useEffect, useRef } from "react";
import type { NodeViewProps } from "@tiptap/react";
import type { KeyboardEvent, MouseEvent } from "react";

const MARKDOWN_LINK_REGEX = /^\[([^\]]*)\]\(([^)]*)\)$/;
const ABSOLUTE_URL_REGEX = /^https?:\/\/\S+$/i;
const DOMAIN_URL_REGEX =
  /^(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?::\d+)?(?:[/?#][^\s]*)?$/i;

export interface HybridLinkAttributes {
  href: string;
  text: string;
  title: string | null;
}

interface HybridLinkOptions {
  HTMLAttributes: Record<string, string>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    hybridLink: {
      setHybridLink: (attributes: Partial<HybridLinkAttributes>) => ReturnType;
    };
  }
}

const normalizeAttributes = (
  attributes: Record<string, unknown>,
): HybridLinkAttributes => {
  const href = typeof attributes.href === "string" ? attributes.href : "";
  const text = typeof attributes.text === "string" ? attributes.text : href;
  const title = typeof attributes.title === "string" ? attributes.title : null;

  return {
    href,
    text: text || href,
    title,
  };
};

const toMarkdownSource = (attributes: HybridLinkAttributes): string => {
  const text = attributes.text || attributes.href;
  return `[${text}](${attributes.href})`;
};

function normalizeHref(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (ABSOLUTE_URL_REGEX.test(trimmed)) {
    return trimmed;
  }

  if (DOMAIN_URL_REGEX.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

const parseMarkdownSource = (
  source: string,
  fallback: HybridLinkAttributes,
): HybridLinkAttributes => {
  const trimmed = source.trim();
  const match = trimmed.match(MARKDOWN_LINK_REGEX);

  if (match) {
    const nextText = match[1].trim();
    const nextHref = match[2].trim();
    const normalizedHref = normalizeHref(nextHref);

    if (!isUrl(normalizedHref)) {
      return fallback;
    }

    return {
      ...fallback,
      href: normalizedHref,
      text: nextText || normalizedHref || fallback.text || fallback.href,
    };
  }

  if (!trimmed) {
    return fallback;
  }

  const normalizedHref = normalizeHref(trimmed);
  if (!isUrl(normalizedHref)) {
    return fallback;
  }

  return {
    ...fallback,
    href: normalizedHref,
    text: fallback.text || normalizedHref,
  };
};

const isUrl = (value: string): boolean => {
  const trimmed = value.trim();
  return ABSOLUTE_URL_REGEX.test(trimmed) || DOMAIN_URL_REGEX.test(trimmed);
};

const parseTailMarkdownLink = (
  textBeforeCursor: string,
): { text: string; href: string; raw: string } | null => {
  const tailMatch = textBeforeCursor.match(/\[([^\]]+)\]\(([^)\s]+)\)$/);
  if (!tailMatch) {
    return null;
  }

  const text = tailMatch[1].trim();
  const href = normalizeHref(tailMatch[2].trim());

  if (!href) {
    return null;
  }

  return {
    text: text || href,
    href,
    raw: tailMatch[0],
  };
};

const extractLinkFromClipboard = (
  event: ClipboardEvent,
): { href: string; text: string } | null => {
  const html = event.clipboardData?.getData("text/html")?.trim() ?? "";
  if (html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const anchor = doc.querySelector("a[href]");

    if (anchor) {
      const href = normalizeHref(anchor.getAttribute("href") ?? "");
      const text = (anchor.textContent ?? "").trim() || href;

      if (isUrl(href)) {
        return { href, text };
      }
    }
  }

  const plainText = event.clipboardData?.getData("text/plain")?.trim() ?? "";
  if (!plainText || !isUrl(plainText)) {
    return null;
  }

  const href = normalizeHref(plainText);
  return {
    href,
    text: href,
  };
};

const HybridLinkNodeView = ({
  editor,
  node,
  getPos,
  updateAttributes,
  selected,
}: NodeViewProps) => {
  const attributes = normalizeAttributes(node.attrs as Record<string, unknown>);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isSourceMode = editor.isEditable && selected;

  useEffect(() => {
    if (!isSourceMode || !inputRef.current) {
      return;
    }

    inputRef.current.focus();
    inputRef.current.select();
  }, [isSourceMode]);

  const commitFromInput = useCallback(() => {
    const rawSource = inputRef.current?.value ?? toMarkdownSource(attributes);
    const nextAttributes = parseMarkdownSource(rawSource, attributes);
    const shouldUpdate =
      nextAttributes.href !== attributes.href ||
      nextAttributes.text !== attributes.text ||
      nextAttributes.title !== attributes.title;

    if (shouldUpdate) {
      updateAttributes(nextAttributes);
    }
  }, [attributes, updateAttributes]);

  const openEditMode = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (!editor.isEditable) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const position = getPos();
      if (typeof position === "number") {
        const selection = NodeSelection.create(editor.state.doc, position);
        editor.view.dispatch(editor.state.tr.setSelection(selection));
      }
    },
    [editor, getPos],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        commitFromInput();
        editor.commands.focus();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        if (inputRef.current) {
          inputRef.current.value = toMarkdownSource(attributes);
        }
        editor.commands.focus();
      }
    },
    [attributes, commitFromInput, editor],
  );

  if (isSourceMode) {
    return (
      <NodeViewWrapper
        as="span"
        contentEditable={false}
        className="hm-inline-flex hm-items-center hm-font-mono hm-bg-gray-100 hm-rounded hm-px-1 hm-text-gray-800"
      >
        <input
          key={`${attributes.text}|${attributes.href}|${attributes.title ?? ""}`}
          ref={inputRef}
          defaultValue={toMarkdownSource(attributes)}
          onBlur={commitFromInput}
          onKeyDown={onKeyDown}
          className="hm-min-w-[14rem] hm-border-none hm-bg-transparent hm-font-mono hm-text-[0.9em] hm-leading-6 focus:hm-outline-none"
          aria-label="Edit markdown link source"
        />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper as="span" contentEditable={false}>
      <a
        href={attributes.href}
        title={attributes.title ?? undefined}
        onClick={openEditMode}
        target={editor.isEditable ? undefined : "_blank"}
        rel={editor.isEditable ? undefined : "noopener noreferrer"}
        className="hm-cursor-pointer hm-text-blue-600 hm-underline"
      >
        {attributes.text || attributes.href}
      </a>
    </NodeViewWrapper>
  );
};

const MemoHybridLinkNodeView = memo(
  HybridLinkNodeView,
  (prevProps, nextProps) =>
    prevProps.selected === nextProps.selected &&
    prevProps.editor === nextProps.editor &&
    prevProps.editor.isEditable === nextProps.editor.isEditable &&
    prevProps.node.eq(nextProps.node),
);

export const HybridLink = Node.create<HybridLinkOptions>({
  name: "hybridLink",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  priority: 1000,

  addOptions() {
    return {
      HTMLAttributes: {
        class: "hm-text-blue-600 hm-underline",
      },
    };
  },

  addAttributes() {
    return {
      href: {
        default: "",
        parseHTML: (element: HTMLElement) =>
          normalizeHref(element.getAttribute("href") ?? ""),
      },
      text: {
        default: "",
        parseHTML: (element: HTMLElement) =>
          element.textContent ?? element.getAttribute("href") ?? "",
        renderHTML: () => {
          return {};
        },
      },
      title: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("title"),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "a[href]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const attributes = normalizeAttributes(
      HTMLAttributes as Record<string, unknown>,
    );
    return [
      "a",
      mergeAttributes(this.options.HTMLAttributes, {
        href: attributes.href,
        title: attributes.title ?? undefined,
      }),
      attributes.text || attributes.href,
    ];
  },

  renderText({ node }) {
    return toMarkdownSource(normalizeAttributes(node.attrs as Record<string, unknown>));
  },

  addCommands() {
    return {
      setHybridLink:
        (attributes) =>
        ({ commands }) => {
          const normalized = normalizeAttributes(
            attributes as Record<string, unknown>,
          );

          return commands.insertContent({
            type: this.name,
            attrs: normalized,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(MemoHybridLinkNodeView, {
      as: "span",
    });
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("hybridLinkPaste"),
        props: {
          handleKeyDown: (view, event) => {
            if (!["Enter", " ", "Tab", ")"].includes(event.key)) {
              return false;
            }

            const { state } = view;
            const { selection } = state;
            if (!selection.empty) {
              return false;
            }

            const $from = selection.$from;
            const parent = $from.parent;
            if (!parent.isTextblock) {
              return false;
            }

            const textBeforeCursor = parent.textBetween(0, $from.parentOffset, " ", " ");
            const candidate = event.key === ")" ? `${textBeforeCursor})` : textBeforeCursor;
            const parsed = parseTailMarkdownLink(candidate);
            if (!parsed) {
              return false;
            }

            const from = $from.start() + (candidate.length - parsed.raw.length);
            const to = $from.pos;
            const hybridLinkNode = this.type.create({
              text: parsed.text,
              href: parsed.href,
              title: null,
            });

            const tr = state.tr.replaceWith(from, to, hybridLinkNode);
            tr.setSelection(TextSelection.create(tr.doc, from + hybridLinkNode.nodeSize));

            view.dispatch(tr.scrollIntoView());
            return event.key === ")";
          },
          handlePaste: (view, event) => {
            const extracted = extractLinkFromClipboard(event);
            if (!extracted) {
              return false;
            }

            const { state, dispatch } = view;
            const { from, to, empty } = state.selection;
            const selectedText = empty
              ? extracted.text
              : state.doc.textBetween(from, to, " ", " ").trim() || extracted.text;

            const node = this.type.create({
              href: extracted.href,
              text: selectedText,
              title: null,
            });

            dispatch(state.tr.replaceSelectionWith(node).scrollIntoView());
            return true;
          },
        },
      }),
    ];
  },
});
