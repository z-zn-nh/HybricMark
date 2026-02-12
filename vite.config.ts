import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    // 自动生成类型定义文件，并把它们合并到 dist 目录
    dts({
      insertTypesEntry: true,
      include: ["src/lib/"],
    }),
  ],
  build: {
    lib: {
      // 入口文件 (稍后我们会创建这个文件)
      entry: path.resolve(__dirname, "src/lib/index.ts"),
      name: "HybricMark",
      fileName: (format) => `hybricmark.${format}.js`,
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ["react", "react-dom", "tailwindcss"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          tailwindcss: "tailwindcss",
        },
      },
    },
  },
});
