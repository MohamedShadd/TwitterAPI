import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { readdir } from 'fs/promises';
import express from "express";
import dotenv from "dotenv";
import path from "path"

dotenv.config();
puppeteer.use(StealthPlugin());
const PORT = process.env.PORT || 10000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const routesDirectory = path.join(path.dirname(new URL(import.meta.url).pathname), "routes");

const loadRoutes = async () => {
  try {
    const files = await readdir(routesDirectory);
    for (const file of files) {
      if (file.endsWith(".js")) {
        const { default: route } = await import(path.join(routesDirectory, file));
        app.use("/", route);
      }
    }
  } catch (error) {
    console.error("Error loading routes:", error);
  }
};

loadRoutes();

app.get("/", async (req, res) => {
  res.status(201).json({ message: "Server online" });
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
