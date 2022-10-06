'use-strict'
const puppeteer = require("puppeteer");
const fs = require('fs');
const https = require('https');

const download = (url, destination) => new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);

    https.get(url, response => {
        response.pipe(file);

        file.on('finish', () => {
            file.close(resolve(true));
        });
    }).on('error', error => {
        fs.unlink(destination);

        reject(error.message);
    });
});

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto("https://www.growpital.com/");

    console.log("loaded");

    const imageSrc = await page.evaluate(() => Array.from(document.images, e => e.src));

    const test = "./images";
    for (let i = 0; i < imageSrc.length; i++) {
        let name = imageSrc[i].split("/").pop();
        const files = await fs.promises.readdir(test);
        if (!files.includes(name)) {
            let result = await download(imageSrc[i], `images/${name}`);

            if (result === true) {
                console.log('Successfully Downloaded:', imageSrc[i]);
            } else {
                console.log('Error:', imageSrc[i], 'was not downloaded.');
                console.error(result);
            }
        }else{
            console.log("This image is already available");
        }

    }

    await browser.close();

}

)();