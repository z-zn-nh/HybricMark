import { useState } from "react";
import { HybricEditor } from "./lib";
import type { Editor } from "@tiptap/core";

function App() {
  const [json, setJson] = useState<unknown>(null);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <HybricEditor
        content="<p></p>"
        editable
        onChange={(editor: Editor) => setJson(editor.getJSON())}
      />
      <pre style={{ marginTop: 24, fontSize: 12 }}>
        {JSON.stringify(json, null, 2)}
      </pre>
    </main>
  );
}

export default App;
