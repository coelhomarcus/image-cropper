import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import gifRoutes from "./routes/gif.js";
import animatedRoutes from "./routes/animated.js";
import { checkGifsicle } from "./services/gifsicle.js";
import { checkImageMagick } from "./services/imagemagick.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = path.join(__dirname, "../../frontend/dist");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.use("/api/gif", gifRoutes);
app.use("/api/animated", animatedRoutes);

app.use(express.static(FRONTEND_DIR));

app.get("*path", (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

async function start() {
  const gifsicleAvailable = await checkGifsicle();
  if (!gifsicleAvailable) console.error("⚠️  gifsicle not found!");

  const imageMagickAvailable = await checkImageMagick();
  if (!imageMagickAvailable) console.error("⚠️  ImageMagick not found! Animated WebP cropping will not work.");

  app.listen(PORT, () => {
    console.log(`🚀 Crop Backend running on http://localhost:${PORT}`);
  });
}

start();
