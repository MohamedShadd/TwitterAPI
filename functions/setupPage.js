import fs from "fs";
import path from "path";

const cookiesFilePath = path.resolve("cookies.json");
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";
const ACCEPT_LANGUAGE = "en-US,en;q=0.9";

export async function setupPage(browser, targetProfile) {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
        "User-Agent": USER_AGENT,
        "accept-language": ACCEPT_LANGUAGE,
    });
    if (fs.existsSync(cookiesFilePath)) {
        const cookies = JSON.parse(fs.readFileSync(cookiesFilePath));
        await page.setCookie(...cookies);
        const loggedIn = await page.evaluate(() => !document.querySelector('input[name="text"]'));
        if (!loggedIn) console.log("Already logged in, sending tweets.");
    }
    return page;
}