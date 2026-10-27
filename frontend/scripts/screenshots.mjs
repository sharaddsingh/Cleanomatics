import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
await mkdir("../docs", { recursive: true });
const browser = await chromium.launch({ channel: "msedge" });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1020 },
    deviceScaleFactor: 1,
  });
  await page.goto("http://127.0.0.1:5173");
  await page.getByText("Showing 1–6 of 6 tasks").waitFor();
  await page.screenshot({
    path: "../docs/dashboard-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "../docs/dashboard-mobile.png",
    fullPage: true,
  });
} finally {
  await browser.close();
}
