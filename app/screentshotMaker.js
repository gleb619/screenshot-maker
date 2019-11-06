const puppeteer = require('puppeteer');
const uniqueString = require('unique-string');
const delay = require('./utils/delay');

const generateUniqueName = () => `/tmp/${uniqueString()}-${new Date().toISOString()}.png`;

async function makeScreenShot({url, delayTime,}) {
    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: {
                width: 1280,
                height: 1024,
            },
        });

        const filePath = generateUniqueName();
        const page = await browser.newPage();

        console.info(`Go to ${url}`);

        await page.goto(url);

        if (delayTime) {
            await delay(delayTime);
        }

        const screenshot = await page.screenshot({
            path: filePath,
            fullPage: true
        });
        
        await page.close();
        await browser.close();

        console.info(`Made site screenshot for ${filePath}`);

        return {
            file: screenshot,
            filePath: filePath,
            success: true
        };
    } catch(e) {
        console.error("Error while making screenshot: \n", e);
        console.error('-----------------------------------------------------------------------------');
        return {
            file: null,
            filePath: null,
            success: false
        };
    }
	
}

module.exports =  makeScreenShot;