const puppeteer = require('puppeteer');
const uniqueString = require('unique-string');
const delay = require('./utils/delay');

const generateUniqueName = () => `${uniqueString()}-${new Date().toISOString()}.png`;

async function makeScreenShot({url, delayTime,}) {
    try {
        const browser = await puppeteer.launch(
            {
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                defaultViewport: {
                    width: 1920,
                    height: 1080,
                },
            });

        const page = await browser.newPage();

        await page.goto(url);
        
        if (delayTime) await delay(delayTime);

        const name = generateUniqueName();

        const screenshot = await page
            .screenshot({
                path: name,
                fullPage: true
            });
        
        await page.close();
        await browser.close();

        console.log('screenshot saved!');


        return {
            file: screenshot,
            filePath: name
        };
    } catch(e) {
        console.error("Error while making screenshot: \n", e);
        console.error('-----------------------------------------------------------------------------');
        return null;
    }
	
}

module.exports =  makeScreenShot;