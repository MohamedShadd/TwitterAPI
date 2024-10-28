export async function collectTweets(page, targetProfile) {
    await page.goto(`https://x.com/${targetProfile}`, {waitUntil: "networkidle2"});
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.5));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return page.evaluate(() => {
        return Array.from(document.querySelectorAll("article")).map((tweet) => {
            const text = tweet.querySelector("div[lang]")?.innerText || "";
            const mediaLinks = Array.from(tweet.querySelectorAll("img")).map((img) => img.src);
            const date = tweet.querySelector("time")?.getAttribute("datetime") || null;
            const link = tweet.querySelector("a[href*='/status/']")?.href || null;
            return {text, mediaLinks, date, link};
        });
    });
}