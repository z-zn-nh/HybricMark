import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#333333",
            fontFamily:
              '"Inter", "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
            lineHeight: "1.7",
            h1: {
              color: "#24292f",
              fontWeight: "600",
              borderBottom: "1px solid #d8dee4",
              paddingBottom: "0.3em",
              marginTop: "1.2em",
              marginBottom: "0.8em",
            },
            h2: {
              color: "#24292f",
              fontWeight: "600",
              borderBottom: "1px solid #d8dee4",
              paddingBottom: "0.3em",
              marginTop: "1.1em",
              marginBottom: "0.7em",
            },
            h3: {
              color: "#24292f",
              fontWeight: "600",
            },
            h4: {
              color: "#24292f",
              fontWeight: "600",
            },
            h5: {
              color: "#24292f",
              fontWeight: "600",
            },
            h6: {
              color: "#24292f",
              fontWeight: "600",
            },
            blockquote: {
              color: "#6a737d",
              borderLeft: "4px solid #dfe2e5",
              paddingLeft: "1em",
              marginLeft: "0",
            },
            a: {
              color: "#0969da",
              textDecoration: "none",
            },
            "a:hover": {
              textDecoration: "underline",
            },
            table: {
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
              display: "table",
            },
            "th, td": {
              border: "1px solid #dfe2e5",
              padding: "6px 13px",
              lineHeight: "1.5",
            },
            th: {
              backgroundColor: "#f8f9fa",
              fontWeight: "700",
              textAlign: "left",
            },
            tr: {
              backgroundColor: "transparent",
            },
            "tbody tr:nth-child(2n)": {
              backgroundColor: "#f6f8fa",
            },
            ".selectedCell": {
              backgroundColor: "rgba(200, 200, 255, 0.4) !important",
            },
            ".column-resize-handle": {
              backgroundColor: "#adf",
              width: "4px",
              pointerEvents: "none",
            },
            "code": {
              backgroundColor: "#f3f4f4",
              borderRadius: "4px",
              padding: "0.2em 0.4em",
              margin: "0 2px",
              fontFamily:
                '"JetBrains Mono", "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace',
              fontSize: "0.9em",
              color: "#24292f",
              whiteSpace: "nowrap",
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            "pre": {
              backgroundColor: "#f6f8fa",
              borderRadius: "6px",
              border: "1px solid #d8dee4",
              padding: "0.75em 1em",
            },
            "pre code": {
              backgroundColor: "transparent",
              padding: "0",
              margin: "0",
              fontSize: "0.85em",
              whiteSpace: "pre",
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};
