import { expect, test } from "@playwright/test";

const PLAYGROUND_URL = process.env.PLAYGROUND_URL ?? "http://localhost:5173";

test.describe("hybricmark playground ux", () => {
  test("typora-like core flow", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await page.goto(PLAYGROUND_URL, { waitUntil: "domcontentloaded" });

    const editor = page.locator(".hm-editor-root .ProseMirror").first();
    await expect(editor).toBeVisible();

    // 1) Type "Hello World" + Enter at document end.
    await editor.click();
    await page.evaluate(() => {
      const root = document.querySelector(".hm-editor-root .ProseMirror");
      if (!(root instanceof HTMLElement)) {
        return;
      }
      root.focus();
      const selection = window.getSelection();
      if (!selection) {
        return;
      }
      const range = document.createRange();
      range.selectNodeContents(root);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    });
    await page.keyboard.type("Hello World");
    await page.keyboard.press("Enter");

    // 2) Verify generated block id exists on created paragraph.
    const helloParagraph = page
      .locator(".hm-editor-root .ProseMirror p")
      .filter({ hasText: "Hello World" })
      .first();
    await expect(helloParagraph).toBeVisible();
    const dataId = await helloParagraph.getAttribute("data-id");
    expect(dataId).toBeTruthy();

    // Also verify id is visible in host JSON panel.
    await expect(page.locator("aside")).toContainText('"id"');

    // 3) IME simulation (Playwright can't fully emulate native IME):
    //    dispatch composition events + insert Chinese text.
    await page.evaluate(() => {
      const root = document.querySelector(".hm-editor-root .ProseMirror");
      if (!(root instanceof HTMLElement)) {
        return;
      }

      root.dispatchEvent(
        new CompositionEvent("compositionstart", {
          bubbles: true,
          cancelable: true,
          data: "n",
        }),
      );
      root.dispatchEvent(
        new CompositionEvent("compositionupdate", {
          bubbles: true,
          cancelable: true,
          data: "ni",
        }),
      );
      document.execCommand("insertText", false, "你好输入法");
      root.dispatchEvent(
        new CompositionEvent("compositionend", {
          bubbles: true,
          cancelable: true,
          data: "你好输入法",
        }),
      );
    });
    await expect(editor).toContainText("你好输入法");

    // 4) Right-click with text selection: expect core text actions.
    const worldAnchor = await page.evaluate(() => {
      const target = Array.from(
        document.querySelectorAll(".hm-editor-root .ProseMirror p"),
      ).find((p) => (p.textContent ?? "").includes("Hello World"));
      if (!(target instanceof HTMLElement)) {
        return null;
      }

      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const text = walker.currentNode.nodeValue ?? "";
        const index = text.indexOf("World");
        if (index < 0) {
          continue;
        }

        const range = document.createRange();
        range.setStart(walker.currentNode, index);
        range.setEnd(walker.currentNode, index + "World".length);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        const rect = range.getBoundingClientRect();
        return {
          x: Math.max(1, Math.floor(rect.left + rect.width / 2)),
          y: Math.max(1, Math.floor(rect.bottom - 2)),
        };
      }

      return null;
    });
    expect(worldAnchor).toBeTruthy();
    await page.mouse.click(worldAnchor!.x, worldAnchor!.y, { button: "right" });

    const menu = page.locator(".hm-context-menu,[data-radix-context-menu-content]");
    await expect(menu).toBeVisible();
    await expect(menu).toContainText(/加粗|Bold/);
    await expect(menu).toContainText(/链接|Link/);

    // 5) Right-click with collapsed caret: expect block/insert operation "Insert Table".
    await page.keyboard.press("Escape");
    const blockAnchor = await page.evaluate(() => {
      const target = Array.from(
        document.querySelectorAll(".hm-editor-root .ProseMirror p"),
      )
        .reverse()
        .find((p) => (p.textContent ?? "").includes("你好输入法"));
      if (!(target instanceof HTMLElement)) {
        return null;
      }

      const range = document.createRange();
      range.selectNodeContents(target);
      range.collapse(false);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      const rect = target.getBoundingClientRect();
      return {
        x: Math.max(1, Math.floor(rect.left + 8)),
        y: Math.max(1, Math.floor(rect.top + Math.min(rect.height / 2, 12))),
      };
    });
    expect(blockAnchor).toBeTruthy();
    await page.mouse.click(blockAnchor!.x, blockAnchor!.y, { button: "right" });
    await expect(menu).toContainText(/插入表格|Insert Table/);

    // 6) Link interaction: click link should keep same page and keep cursor in link text.
    await page.keyboard.press("Escape");
    const beforeUrl = page.url();
    const link = page.locator(".hm-editor-root .ProseMirror a[href='https://tiptap.dev']");
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(beforeUrl);

    const cursorInsideLink = await page.evaluate(() => {
      const selection = window.getSelection();
      if (!selection?.anchorNode) {
        return false;
      }
      const anchorElement =
        selection.anchorNode instanceof Element
          ? selection.anchorNode
          : selection.anchorNode.parentElement;
      return Boolean(anchorElement?.closest("a[href]"));
    });
    expect(cursorInsideLink).toBeTruthy();

    expect(pageErrors).toEqual([]);
  });
});
