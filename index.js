import puppeteer from "puppeteer";
// import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";
import express from "express";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const verificationInput = process.env.VERIFCATION;

// puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/fetchTweets", async (req, res) => {
  const targetProfile = req.query.targetProfile
  const cookiesFilePath = path.resolve("cookies.json");
  let browser;
  let page;
  let allTweets = [];
  const openBrowser = async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });
    page = await browser.newPage();

    await page.setExtraHTTPHeaders({
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      "accept-language": "en-US,en;q=0.9",
    });

    if (fs.existsSync(cookiesFilePath)) {
      const cookies = JSON.parse(fs.readFileSync(cookiesFilePath));
      await page.setCookie(...cookies);
      await page.goto(`https://x.com/${targetProfile}`, {
        waitUntil: "networkidle2",
      });
      const loggedIn = await page.evaluate(
        () => !!document.querySelector('input[name="text"]')
      );
      if (!loggedIn) {
        console.log("Already logged in, sending tweets.");
      } else {
        console.log("Cookies present but login required.");
      }
    }

    if (!fs.existsSync(cookiesFilePath) || page.url().includes("login")) {
      console.log("Logging into Twitter...");

      await page.goto("https://x.com/login", {
        waitUntil: "networkidle2",
        timeout: 50000,
      });
      await page.waitForSelector('input[name="text"]', { timeout: 50000 });

      await page.type('input[name="text"]', username, {
        delay: Math.floor(Math.random() * 200) + 50,
      });

      await page.evaluate(() => {
        const button = Array.from(document.querySelectorAll("button")).find(
          (btn) => btn.textContent.includes("Next")
        );
        if (button) {
          button.click();
        } else {
          console.log("Next button not found");
        }
      });

      try {
        await page.waitForSelector(
          'input[data-testid="ocfEnterTextTextInput"]',
          { timeout: 1500 }
        );
        console.log("Entering verification data...");
        await page.type(
          'input[data-testid="ocfEnterTextTextInput"]',
          verificationInput,
          { delay: Math.floor(Math.random() * 200) + 50 }
        );
        await page.evaluate(() => {
          const button = Array.from(document.querySelectorAll("button")).find(
            (btn) => btn.textContent.includes("Next")
          );
          if (button) {
            button.click();
          } else {
            console.log("Verification Next button not found");
          }
        });
      } catch (error) {
        console.log(
          "Email verification screen not presented. Proceeding to password entry..."
        );
      }

      await page.waitForSelector('input[name="password"]', { timeout: 20000 });
      await page.type('input[name="password"]', password, {
        delay: Math.floor(Math.random() * 200) + 50,
      });

      await page.evaluate(() => {
        const button = Array.from(document.querySelectorAll("button")).find(
          (btn) => btn.textContent.includes("Log in")
        );
        if (button) {
          button.click();
        } else {
          console.log("Log In button not found");
        }
      });

      await page.waitForNavigation({
        waitUntil: "networkidle2",
        timeout: 50000,
      });

      const cookies = await page.cookies();
      fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies, null, 2));
      console.log("Login successful and cookies stored.");
    }
  };

  const fetchTweets = async () => {
    await page.goto(`https://x.com/${targetProfile}`, {
      waitUntil: "networkidle2",
    });
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.5));
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const tweets = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("article")).map((tweet) => {
        const text = tweet.querySelector("div[lang]")?.innerText || "";
        const mediaLinks = Array.from(tweet.querySelectorAll("img")).map(
          (img) => img.src
        );
        const date =
          tweet.querySelector("time")?.getAttribute("datetime") || null;
        const link = tweet.querySelector("a[href*='/status/']")?.href || null;
        return { text, mediaLinks, date, link };
      });
    });

    allTweets = tweets;
  };

  try {
    await openBrowser();
    await fetchTweets();
    res.json({ tweets: allTweets });
  } catch (error) {
    console.error("Error fetching tweets:", error);
    res.status(500).json({ error: "Failed to fetch tweets." });
  } finally {
    if (browser) await browser.close();
  }
});

app.get("/", async (req, res) => {
  res.status(201).json({ message: "Server online" });
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
