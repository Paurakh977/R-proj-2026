import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

interface PredictRequest {
  title: string;
  price: number;
  category: string;
  gender: string;
  market: string;
}

export async function POST(request: Request) {
  const body: PredictRequest = await request.json();

  const scriptPath = path.join(process.cwd(), "scripts", "predict.py");

  const result = await new Promise<{ data?: Record<string, unknown>; error?: string }>((resolve) => {
    const proc = spawn("python", [scriptPath], {
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on("close", () => {
      try {
        const parsed = JSON.parse(stdout);
        if (parsed.error) {
          resolve({ error: parsed.error });
        } else {
          resolve({ data: parsed });
        }
      } catch {
        resolve({ error: stderr || "Failed to parse model output" });
      }
    });

    proc.on("error", (err) => {
      resolve({ error: `Failed to start Python: ${err.message}` });
    });

    proc.stdin.write(JSON.stringify(body));
    proc.stdin.end();
  });

  if (result.error) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: result.data });
}
