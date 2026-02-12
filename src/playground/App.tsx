import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import type { Editor, JSONContent } from "@tiptap/core";

import { HybricEditor } from "../lib";

type PanelTab = "data" | "logs";

interface EventLogItem {
  id: string;
  type: "CHANGE" | "EXTRACT";
  at: string;
  message: string;
}

const SAMPLE_MARKDOWN = `# HybricMark Playground
## Typora-like Hybrid Rendering

- Right click selected text to format quickly.
- Right click a block to copy block ID or transform it.
- Use "Extract to Card" from context menu.
- Try typing "/" in an empty line.

#### Heading 4
##### Heading 5
###### Heading 6

- Parent bullet
  - Child bullet
    - Grandchild bullet

- [ ] Task item pending
- [x] Task item done

This paragraph includes **bold**, *italic*, <u>underline</u>, ==highlight==, <sub>sub</sub> and <sup>sup</sup>.
Inline code: \`alpha\` and \`beta\`.
This line contains a link: [Tiptap Docs](https://tiptap.dev)

| Col A | Col B |
| --- | --- |
| A1 | B1 |
| A2 | B2 |

Inline formula: $E = mc^2$
Footnote ref demo[^1]

[^1]: Footnote demo (parser dependent)
<div>Raw HTML block demo</div>`;

const formatTime = (): string =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());

const toEventId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10);
};

const pushWithLimit = (
  previous: EventLogItem[],
  item: EventLogItem,
  limit = 120,
): EventLogItem[] => [item, ...previous].slice(0, limit);

const collectBlockIds = (node: unknown, acc: string[] = []): string[] => {
  if (!node || typeof node !== "object") {
    return acc;
  }

  const maybeNode = node as { attrs?: { id?: unknown }; content?: unknown[] };
  const maybeId = maybeNode.attrs?.id;

  if (typeof maybeId === "string") {
    acc.push(maybeId);
  }

  if (Array.isArray(maybeNode.content)) {
    maybeNode.content.forEach((child) => {
      collectBlockIds(child, acc);
    });
  }

  return acc;
};

function highlightJsonLine(line: string, index: number): ReactElement {
  const idPattern = /("id"\s*:\s*)(".*?")/;
  const match = line.match(idPattern);

  if (!match) {
    return (
      <div key={`line-${index}`} className="whitespace-pre text-gray-300">
        {line}
      </div>
    );
  }

  const whole = match[0];
  const start = line.indexOf(whole);
  const prefix = line.slice(0, start);
  const suffix = line.slice(start + whole.length);

  return (
    <div key={`line-${index}`} className="whitespace-pre text-gray-300">
      {prefix}
      <span className="font-semibold text-red-400">{match[1]}</span>
      <span className="font-bold text-red-300">{match[2]}</span>
      {suffix}
    </div>
  );
}

function StatChip({ children }: { children: ReactNode }): ReactElement {
  return (
    <span className="rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-[11px] text-gray-300">
      {children}
    </span>
  );
}

export default function App() {
  const [tab, setTab] = useState<PanelTab>("data");
  const [docJson, setDocJson] = useState<JSONContent | null>(null);
  const [logs, setLogs] = useState<EventLogItem[]>([]);
  const changeLogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initialContent = useMemo(() => SAMPLE_MARKDOWN, []);

  const jsonText = useMemo(
    () => JSON.stringify(docJson ?? { type: "doc", content: [] }, null, 2),
    [docJson],
  );
  const jsonLines = useMemo(() => jsonText.split("\n"), [jsonText]);
  const blockIds = useMemo(() => collectBlockIds(docJson), [docJson]);

  useEffect(() => {
    return () => {
      if (changeLogTimerRef.current) {
        clearTimeout(changeLogTimerRef.current);
      }
    };
  }, []);

  const pushLog = (type: EventLogItem["type"], message: string): void => {
    setLogs((previous) =>
      pushWithLimit(previous, {
        id: toEventId(),
        type,
        at: formatTime(),
        message,
      }),
    );
  };

  const handleChange = (editor: Editor): void => {
    const nextJson = editor.getJSON();
    setDocJson(nextJson);

    if (changeLogTimerRef.current) {
      clearTimeout(changeLogTimerRef.current);
    }

    changeLogTimerRef.current = setTimeout(() => {
      const totalBlocks = Array.isArray(nextJson.content) ? nextJson.content.length : 0;
      pushLog("CHANGE", `[CHANGE] ${totalBlocks} top-level blocks updated`);
    }, 280);
  };

  const handleExtract = (payload: { id: string; content: JSONContent }): void => {
    const preview = JSON.stringify(payload.content)
      .replace(/\s+/g, " ")
      .slice(0, 120);

    pushLog(
      "EXTRACT",
      `🚀 [EXTRACT] Block ID: ${payload.id} | Content Preview: ${preview}`,
    );
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-950">
      <div className="flex h-full w-full">
        <main className="relative min-w-0 flex-1 bg-gradient-to-b from-gray-100 to-gray-50">
          <header className="flex h-14 items-center justify-between border-b border-gray-200/80 bg-white/70 px-8 backdrop-blur">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-gray-400">
                HybricMark Playground
              </p>
              <p className="text-sm font-medium text-gray-700">Typora-like Editor Host Simulation</p>
            </div>
          </header>

          <section className="h-[calc(100vh-3.5rem)] overflow-auto">
            <div className="mx-auto h-full w-full max-w-6xl px-8 py-10">
              <div className="hm-prose hm-prose-lg hm-max-w-none">
                <HybricEditor
                  content={initialContent}
                  onChange={handleChange}
                  onExtract={handleExtract}
                  className="hm-prose hm-prose-lg hm-max-w-none"
                />
              </div>
            </div>
          </section>
        </main>

        <aside className="h-full w-[420px] shrink-0 border-l border-gray-800 bg-gray-900 text-gray-200">
          <div className="flex h-full flex-col p-4">
            <h2 className="text-lg font-semibold text-gray-100">Host DevTools</h2>
            <p className="mt-1 text-xs text-gray-400">
              Real-time editor state and event bus simulation
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-gray-800 p-1">
              <button
                type="button"
                onClick={() => setTab("data")}
                className={`rounded-md px-3 py-2 text-xs font-medium transition ${
                  tab === "data"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                Real-time Data
              </button>
              <button
                type="button"
                onClick={() => setTab("logs")}
                className={`rounded-md px-3 py-2 text-xs font-medium transition ${
                  tab === "logs"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                Event Bus
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatChip>Block IDs: {blockIds.length}</StatChip>
              <StatChip>Logs: {logs.length}</StatChip>
            </div>

            {tab === "data" ? (
              <section className="mt-4 flex min-h-0 flex-1 flex-col gap-3">
                <div className="rounded-lg border border-gray-700 bg-gray-950/60 p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
                    Block UUIDs
                  </p>
                  {blockIds.length === 0 ? (
                    <p className="mt-2 text-xs text-gray-400">No IDs yet.</p>
                  ) : (
                    <div className="mt-2 flex max-h-24 flex-wrap gap-2 overflow-auto pr-1">
                      {blockIds.map((id) => (
                        <code
                          key={id}
                          className="rounded border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[11px] text-red-300"
                        >
                          {id}
                        </code>
                      ))}
                    </div>
                  )}
                </div>

                <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-gray-700 bg-gray-950/80 p-3 font-mono text-xs leading-5">
                  <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-gray-500">
                    editor.getJSON()
                  </p>
                  <pre className="m-0">{jsonLines.map((line, idx) => highlightJsonLine(line, idx))}</pre>
                </div>
              </section>
            ) : (
              <section className="mt-4 min-h-0 flex-1 overflow-auto rounded-lg border border-gray-700 bg-gray-950/80 p-3">
                {logs.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No events yet. Edit text or run Extract to Card.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {logs.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-md border border-gray-800 bg-gray-900/70 p-2"
                      >
                        <div className="mb-1 flex items-center justify-between text-[11px]">
                          <span
                            className={
                              item.type === "EXTRACT"
                                ? "font-semibold text-emerald-300"
                                : "font-semibold text-blue-300"
                            }
                          >
                            {item.type}
                          </span>
                          <span className="text-gray-500">{item.at}</span>
                        </div>
                        <p className="text-xs leading-relaxed text-gray-300">{item.message}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
