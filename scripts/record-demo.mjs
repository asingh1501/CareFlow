import { spawn, spawnSync } from "node:child_process";
import { mkdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "artifacts");
const webmPath = path.join(outputDir, "careflow-demo.webm");
const mp4Path = path.join(outputDir, "careflow-demo.mp4");
const explicitBaseUrl = process.env.CAREFLOW_BASE_URL;
const baseUrl = (explicitBaseUrl || "http://127.0.0.1:3000").replace(/\/$/, "");
let server;

async function responds() {
  try {
    const response = await fetch(`${baseUrl}/demo`);
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForServer() {
  const started = Date.now();
  while (Date.now() - started < 120_000) {
    if (await responds()) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`CareFlow did not become available at ${baseUrl}.`);
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  if (!(await responds())) {
    if (explicitBaseUrl) throw new Error(`CAREFLOW_BASE_URL is unavailable: ${baseUrl}`);
    server = spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", "3000"], { cwd: root, stdio: "inherit", env: process.env });
    await waitForServer();
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: outputDir, size: { width: 1920, height: 1080 } },
    colorScheme: "light",
  });
  const page = await context.newPage();
  const browserErrors = [];
  page.on("console", (message) => { if (message.type() === "error") browserErrors.push(message.text()); });
  page.on("pageerror", (error) => browserErrors.push(error.message));
  await page.goto(`${baseUrl}/demo`, { waitUntil: "networkidle" });
  const video = page.video();
  if (!video) throw new Error("Playwright did not initialize video recording.");

  await page.getByRole("button", { name: "Start Demo" }).click();
  await page.locator("[data-demo-status]").waitFor({ state: "visible" });
  await page.waitForFunction(() => document.querySelector("[data-demo-status]")?.getAttribute("data-demo-status") === "completed", undefined, { timeout: 70_000 });
  await page.waitForTimeout(1_000);
  await page.close();
  await video.saveAs(webmPath);
  await context.close();
  await browser.close();

  if (browserErrors.length) throw new Error(`Browser errors during recording:\n${browserErrors.join("\n")}`);
  const webm = await stat(webmPath);
  if (webm.size < 100_000) throw new Error("The recorded WebM is unexpectedly small.");

  const ffmpeg = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  if (ffmpeg.status !== 0) {
    console.log(`Recorded WebM: ${webmPath}`);
    console.log("FFmpeg is unavailable; MP4 conversion was skipped.");
    return;
  }

  const conversion = spawnSync("ffmpeg", ["-y", "-i", webmPath, "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", mp4Path], { stdio: "inherit" });
  if (conversion.status !== 0) throw new Error("FFmpeg could not convert the recorded demo to MP4.");
  const mp4 = await stat(mp4Path);
  if (mp4.size < 100_000) throw new Error("The generated MP4 is unexpectedly small.");
  console.log(`Recorded WebM: ${webmPath}`);
  console.log(`Generated MP4: ${mp4Path}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}).finally(() => {
  if (server && !server.killed) server.kill("SIGTERM");
});
