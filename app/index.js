const express = require('express');
const fs = require('fs');
const webshot = require('webshot');
const servershot = require('node-server-screenshot');
const cron = require('node-cron');
const uuid = require('uuid-random');
const { WebClient } = require('@slack/web-api');

const token = process.env.SLACK_TOKEN || 'YOURS-DEFAULT-TOKEN';
const site = process.env.SITE || 'https://google.com';
const channel = process.env.CHANNEL || 'random';
const web = new WebClient(token);
const app = express();
const port = 9000;
const service = {};

/* ====================== */

app.get('/api/shoot', (req, res) => {
    service.work();
    res.send('OK');
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

cron.schedule('*/30 * * * *', () => {
    console.log('Running a task every 30 minute');
    service.work();
});

/* ====================== */

service.work = async () => {
    try {
        console.log(`Prepare to check site[${site}] health at ${service.now()}...`);
        const screenshotFile = await service.makeScreenshot();
        const message = await service.sendMessage(screenshotFile);
    } catch (e) {
        console.error(e)
    }
};

service.makeScreenshot = () => {
    return new Promise(resolve => {
        const file = `/tmp/${uuid()}.png`;
        let options = {
            renderDelay: 3000,
            screenSize: {
                width: 1280,
                height: 1024
            },
            userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36'
        };

        try {
            webshot(site, file, options, function (err) {
                if (err != null) {
                    console.error(err);
                } else {
                    console.log(`Made site screenshot for ${file}`);
                }

                resolve(file);
            });
        } catch (e) {
            console.error(e);
            resolve(file);
        }

    });
};

service.makeScreenshot2 = () => {
    return new Promise(resolve => {
        const file = `/tmp/${uuid()}.png`;
        let options = {
            waitMilliseconds: 3000,
            width: 1280,
            height: 1024
        };

        try {
            servershot.fromURL(site, file, options, function () {
                console.log(`Made site screenshot for ${file}`);
                resolve(file);
            });
        } catch (e) {
            console.error(e);
            resolve(file);
        }
    });
};

service.sendMessage = async ( screenshotFile ) => {
    console.log('Sending screenshot to slack');
    // const res = await web.chat.postMessage({
    //     channel: channel,
    //     text: 'Hello there',
    //     as_user: true
    // });

    const res2 = await web.files.upload({
        filename: `${service.now()}.png`,
        fileType: 'png',
        title: service.now(),
        channels: channel,
        file: fs.createReadStream(screenshotFile)
    });

    service.removeFile(screenshotFile);

    // console.log('Message sending status: ', res.ok);
    console.log('File sending status: ', res2.ok);
    console.log('-----');
};

service.now = () => {
    return new Date().toISOString()
        .replace(/T/, ' ')
        .replace(/\..+/, '')
};

service.removeFile = ( filename ) => {
    fs.exists(filename, function(exists) {
        if(exists) {
            console.log('File exists. Deleting now ...');
            fs.unlink(filename);
        }
    });
};
