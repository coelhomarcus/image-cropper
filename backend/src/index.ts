import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import gifRoutes from "./routes/gif.js";
import { checkGifsicle } from "./services/gifsicle.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = path.join(__dirname, "../../frontend/dist");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.use("/api/gif", gifRoutes);

// Serve frontend static files
app.use(express.static(FRONTEND_DIR));

// SPA fallback — any non-API route serves index.html
app.get("*path", (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

async function start() {
  const gifsicleAvailable = await checkGifsicle();
  if (!gifsicleAvailable) {
    console.error("⚠️  gifsicle not found!");
  }

  app.listen(PORT, () => {
    console.log(`🚀 GIF Processor running on http://localhost:${PORT}`);
  });
}

start();
