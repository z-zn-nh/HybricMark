import { mergeAttributes, Node, nodeInputRule } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NodeViewProps } from "@tiptap/react";
import type { KeyboardEvent, MouseEvent } from "react";

const MARKDOWN_LINK_REGEX = /^\[([^\]]*)\]\(([^)]*)\)$/;
const MARKDOWN_LINK_INPUT_REGEX = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/;

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

const parseMarkdownSource = (
  source: string,
  fallback: HybridLinkAttributes,
): HybridLinkAttributes => {
  const trimmed = source.trim();
  const match = trimmed.match(MARKDOWN_LINK_REGEX);

  if (match) {
    const nextText = match[1].trim();
    const nextHref = match[2].trim();

    return {
      ...fallback,
      href: nextHref || fallback.href,
      text: nextText || nextHref || fallback.text || fallback.href,
    };
  }

  if (!trimmed) {
    return fallback;
  }

  return {
    ...fallback,
    href: trimmed,
    text: fallback.text || trimmed,
  };
};

const HybridLinkNodeView = ({
  editor,
  node,
  getPos,
  updateAttributes,
}: NodeViewProps) => {
  const attributes = normalizeAttributes(node.attrs as Record<string, unknown>);
  const [isEditing, setIsEditing] = useState(false);
  const [source, setSource] = useState(() => toMarkdownSource(attributes));
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isEditing || !inputRef.current) {
      return;
    }

    inputRef.current.focus();
    inputRef.current.select();
  }, [isEditing]);

  const commit = useCallback(() => {
    const nextAttributes = parseMarkdownSource(source, attributes);
    const shouldUpdate =
      nextAttributes.href !== attributes.href ||
      nextAttributes.text !== attributes.text ||
      nextAttributes.title !== attributes.title;

    if (shouldUpdate) {
      updateAttributes(nextAttributes);
    }

    setIsEditing(false);
  }, [attributes, source, updateAttributes]);

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

      setSource(toMarkdownSource(attributes));
      setIsEditing(true);
    },
    [attributes, editor, getPos],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        commit();
        editor.commands.focus();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setSource(toMarkdownSource(attributes));
        setIsEditing(false);
        editor.commands.focus();
      }
    },
    [attributes, commit, editor],
  );

  if (isEditing && editor.isEditable) {
    return (
      <NodeViewWrapper
        as="span"
        contentEditable={false}
        className="hm-inline-flex hm-items-center hm-rounded hm-bg-zinc-100 hm-px-1 hm-py-0.5 hm-text-zinc-800"
      >
        <input
          ref={inputRef}
          value={source}
          onBlur={commit}
          onChange={(event) => setSource(event.target.value)}
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
        className="hm-cursor-pointer hm-text-sky-700 hm-underline hm-underline-offset-2"
      >
        {attributes.text || attributes.href}
      </a>
    </NodeViewWrapper>
  );
};

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
        class: "hm-text-sky-700 hm-underline hm-underline-offset-2",
      },
    };
  },

  addAttributes() {
    return {
      href: {
        default: "",
        parseHTML: (element: HTMLElement) => element.getAttribute("href") ?? "",
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

  addInputRules() {
    return [
      nodeInputRule({
        find: MARKDOWN_LINK_INPUT_REGEX,
        type: this.type,
        getAttributes: (match) => {
          const text = typeof match[1] === "string" ? match[1] : "";
          const href = typeof match[2] === "string" ? match[2] : "";

          return {
            text,
            href,
            title: null,
          };
        },
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(HybridLinkNodeView, {
      as: "span",
    });
  },
});
