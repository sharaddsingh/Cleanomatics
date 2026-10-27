import { defineConfig } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const backendDirectory = fileURLToPath(new URL("../backend", import.meta.url));
const virtualenvPython = fileURLToPath(
  new URL(
    process.platform === "win32"
      ? "../backend/.venv/Scripts/python.exe"
      : "../backend/.venv/bin/python",
    import.meta.url,
  ),
);
const python =
  process.env.PYTHON_BIN ||
  (existsSync(virtualenvPython) ? virtualenvPython : "python");

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:15174",
    browserName: "chromium",
    ...(process.platform === "win32" ? { channel: "msedge" } : {}),
    headless: true,
    screenshot: "only-on-failure",
  },
  reporter: "list",
  // Dedicated disposable processes: never reuse or clear the user's demo API.
  webServer: [
    {
      command: `"${python}" -m uvicorn app.main:app --host 127.0.0.1 --port 18081`,
      cwd: backendDirectory,
      port: 18081,
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --port 15174",
      env: {
        API_PROXY_TARGET: "http://127.0.0.1:18081",
        VITE_API_BASE_URL: "",
      },
      port: 15174,
      reuseExistingServer: false,
    },
  ],
});
