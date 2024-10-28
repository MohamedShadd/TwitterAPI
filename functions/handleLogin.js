import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const verificationInput = process.env.VERIFCATION;
dotenv.config();

const cookiesFilePath = path.resolve("cookies.json");

export async function handleLogin(page) {
    if (!fs.existsSync(cookiesFilePath) || page.url().includes("login")) {
        console.log("Logging into Twitter...");
        await page.goto("https://x.com/login", {waitUntil: "networkidle2", timeout: 50000});
        await page.waitForSelector('input[name="text"]', {timeout: 50000});
        await page.type('input[name="text"]', username, {delay: 100});
        await page.evaluate(() => {
            const button = Array.from(document.querySelectorAll("button")).find(
                (btn) => btn.textContent.includes("Next")
            );
            if (button) button.click();
        });
        try {
            await page.waitForSelector('input[data-testid="ocfEnterTextTextInput"]', {timeout: 1500});
            console.log("Entering verification data...");
            await page.type('input[data-testid="ocfEnterTextTextInput"]', verificationInput, {delay: 100});
            await page.evaluate(() => {
                const button = Array.from(document.querySelectorAll("button")).find(
                    (btn) => btn.textContent.includes("Next")
                );
                if (button) button.click();
            });
        } catch (error) {
            console.log("Email verification not required. Proceeding to password entry...");
        }
        await page.waitForSelector('input[name="password"]', {timeout: 20000});
        await page.type('input[name="password"]', password, {delay: 100});
        await page.evaluate(() => {
            const button = Array.from(document.querySelectorAll("button")).find((btn) => btn.textContent.includes("Log in"));
            if (button) button.click();
        });
        await page.waitForNavigation({waitUntil: "networkidle2", timeout: 50000});
        const cookies = await page.cookies();
        fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies, null, 2));
        console.log("Login successful and cookies stored.");
    }
}