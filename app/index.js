const express = require('express');
const fs = require('fs');
const cron = require('node-cron');
const makeScreenshot = require('./screentshotMaker'); 
const { WebClient } = require('@slack/web-api');
const imageDiff = require('image-diff');
require('dotenv').config({
    path: '../.env'
});


const token = process.env.SLACK_TOKEN || 'YOURS-DEFAULT-TOKEN';
const site = process.env.SITE || 'https://google.com';
const channel = process.env.CHANNEL || 'random';
const delayTime = process.env.DELAY_TIME || 3000;
const web = new WebClient(token);
const app = express();
const port = process.env.SERVER_PORT || 9000;
const service = {

    makeScreenshot: makeScreenshot

};

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
        const screenshotResult = await service.makeScreenshot({
            url: site,
            delayTime
        });
        service.detectChanges();

        if(screenshotResult.success) {
            const message = await service.sendMessage(screenshotResult.filePath);
        }
        service.backupFile(screenshotResult.filePath);
        // service.removeFile(screenshotResult.filePath);
    } catch (e) {
        console.error(e)
    }
};

service.sendMessage = async ( screenshotFile ) => {
    console.log('Sending screenshot to slack');

    try {
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

        console.log('File sending status: ', res2.ok);
    } catch(e) {
        console.error(e);
        return;
    }

};

service.detectChanges = ( newFile, oldFile ) => {
    console.log('Detecting changes');

    imageDiff.getFullResult({
        actualImage: oldFile,
        expectedImage: newFile
        // ,diffImage: 'difference.png',
    }, function (err, result) {
        console.info('result: ', result);
    });
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
            fs.unlink(filename, (err) => {
                if (err) {
                    console.log('There is an error occured when deleting file');
                    return;
                }
                console.log('File deleted')
            });
        } else {
            console.log('File does not exist');
        }
    });
};
