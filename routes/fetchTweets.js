import {initializeBrowser} from "../functions/initializeBrowser.js";
import {setupPage} from "../functions/setupPage.js";
import {handleLogin} from "../functions/handleLogin.js";
import {collectTweets} from "../functions/collectTweets.js";
import express from "express";

const Router = express.Router();

Router.get("/fetchTweets", async (req, res) => {
    const targetProfile = req.query.targetProfile
    if(!targetProfile) {
        return res.status(400).json({error:"targetProfile param not specified"})
    }
    let browser;
    try {
        browser = await initializeBrowser();
        const page = await setupPage(browser, targetProfile);
        await handleLogin(page);
        const allTweets = await collectTweets(page, targetProfile);
        res.json({tweets: allTweets});
    } catch (error) {
        console.error("Error fetching tweets:", error);
        res.status(500).json({error: "Failed to fetch tweets."});
    } finally {
        if (browser) await browser.close();
    }
});

export default Router