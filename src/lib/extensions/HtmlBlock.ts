import { mergeAttributes, Node } from "@tiptap/core";

export interface HtmlBlockOptions {
  HTMLAttributes: Record<string, string>;
}

export const HtmlBlock = Node.create<HtmlBlockOptions>({
  name: "htmlBlock",
  group: "block",
  content: "inline*",

  addOptions() {
    return {
      HTMLAttributes: {
        class: "hm-html-block",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div:not([data-type])",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
});

export default HtmlBlock;
