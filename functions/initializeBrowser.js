import puppeteer from "puppeteer-extra";
import dotenv from "dotenv";
dotenv.config();

export async function initializeBrowser() {
    return puppeteer.launch({
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath:
            process.env.NODE_ENV === "production"
                ? process.env.PUPPETEER_EXECUTABLE_PATH
                : puppeteer.executablePath(),
    });
}