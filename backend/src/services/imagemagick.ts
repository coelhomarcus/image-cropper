import { spawn } from "child_process";
import { writeFile, unlink, readFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { tmpdir } from "os";

export async function convertWebPToGif(inputBuffer: Buffer): Promise<Buffer> {
  const tempDir = tmpdir();
  const inputPath = join(tempDir, `input-${randomUUID()}.webp`);
  const outputPath = join(tempDir, `output-${randomUUID()}.gif`);

  try {
    await writeFile(inputPath, inputBuffer);

    await runCommand("magick", [inputPath, outputPath]);

    return await readFile(outputPath);
  } finally {
    await Promise.all([
      unlink(inputPath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
    ]);
  }
}

function runCommand(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args);

    let stderr = "";

    proc.stderr.on("data", (data: unknown) => {
      stderr += String(data);
    });

    proc.on("close", (code: number | null) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${cmd} failed with code ${code}: ${stderr}`));
      }
    });

    proc.on("error", (err: Error) => {
      reject(new Error(`Failed to spawn ${cmd}: ${err.message}`));
    });
  });
}

export async function checkImageMagick(): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn("magick", ["-version"]);
    proc.on("close", (code: number | null) => resolve(code === 0));
    proc.on("error", () => resolve(false));
  });
}
