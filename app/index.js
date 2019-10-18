const express = require('express');
const fs = require('fs');
const cron = require('node-cron');
const makeScreenshot = require('./screentshotMaker'); 
const { WebClient } = require('@slack/web-api');
require('dotenv').config({
    path: '../.env'
})


const token = process.env.SLACK_TOKEN || 'YOURS-DEFAULT-TOKEN';
const site = process.env.SITE || 'https://google.com';
const channel = process.env.CHANNEL || 'DEFAULT';
const delayTime = process.env.DELAY_TIME || 10000;
const web = new WebClient(token);
const app = express();
const port = 9000;
const service = {};


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
        const { file, filePath } = await service.makeScreenshot({
            url: site,
            delayTime
        });
        console.log(file, filePath);
        const message = await service.sendMessage(filePath);

        // service.removeFile(filePath);

    } catch (e) {
        console.error(e)
    }
};

service.makeScreenshot = makeScreenshot;

service.sendMessage = async ( screenshotFile ) => {
    console.log('Sending screenshot to slack');

    try {
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

service.now = () => {
    return new Date().toISOString()
        .replace(/T/, ' ')
        .replace(/\..+/, '')
};

service.removeFile = ( filename ) => {
    console.log('Delete file');
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
