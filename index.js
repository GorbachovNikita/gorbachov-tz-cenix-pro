const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async function() {

    if(process.argv[2] && process.argv[3]) {

        let pageLink = process.argv[2];
        let region = process.argv[3];


        const browser = await puppeteer.launch({
            headless: false
        })
        const page = await browser.newPage()
        await page.goto(pageLink)


        const closedOpenPageMenuButton = await page.waitForSelector('.Content_remove__qdwv0')
        await closedOpenPageMenuButton.evaluate(btn => btn.click());

        const buttonMenu = await page.waitForSelector('.BurgerButton_burger__k87p1');
        await buttonMenu.evaluate(btn => btn.click());

        const regionMenu = await page.waitForSelector('.FeatureAddressSettingMobile_text__R1icU');
        await regionMenu.evaluate(btn => btn.click());

        await page.waitForSelector('.UiRegionListBase_list__cH0fK');

        await page.evaluate((region) => {
            const elements = document.querySelectorAll('.UiRegionListBase_bold__ezwq4');
            const list = Array.from(elements, element => element.textContent);

            if (list.includes(region) == false) {
                region = document.querySelectorAll('.UiRegionListBase_bold__ezwq4')[0].textContent
            }

            let selectRegionId = list.indexOf(region)

            document.querySelectorAll('.UiRegionListBase_bold__ezwq4')[selectRegionId].click();

            return true
        }, region)


        await page.waitForSelector('.Price_role_discount__l_tpE');

        const priceElem = await page.waitForSelector('.Price_role_discount__l_tpE');
        const price = await priceElem.evaluate(el => el.textContent.split(' ')[0].replace(',', '.'));

        const priceOldElem = await page.waitForSelector('.Price_role_old__r1uT1');
        const priceOld = await priceOldElem.evaluate(el => el.textContent.split(' ')[0].replace(',', '.'));

        const ratingElem = await page.waitForSelector('.ActionsRow_stars__EKt42');
        const rating = await ratingElem.evaluate(el => el.textContent);

        const reviewCountElem = await page.waitForSelector('.ActionsRow_reviews__AfSj_'); // select the element
        const reviewCount = await reviewCountElem.evaluate(el => el.textContent.split(' ')[0]);

        let fileText = `price=${price}
priceOld=${priceOld}
rating=${rating}
reviewCount=${reviewCount}`;

        let dirName = region

        if(dirName.toString().slice(-1) == '.') {
            dirName = region.slice(0, -1)
        }

        if(!fs.existsSync(path.resolve(__dirname, 'results', dirName))) {
            fs.mkdirSync(path.resolve(__dirname, 'results', dirName), { recursive: true });
        }

        fs.writeFile(path.resolve(__dirname, 'results', dirName, 'product.txt'), fileText, (err) => {if(err) {throw err;}});


        const closedCookieButton = await page.waitForSelector('.OutlineButton_color_primary___NYOX')
        await closedCookieButton.evaluate(btn => btn.click());

        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });

        await page.waitForSelector('.UiFooterHorizontalBase_footer__Pysr9')

        const el = await page.waitForSelector('.UiHeaderHorizontalBase_headerPortal__hNBbM');
        await el.evaluate(el => el.remove());

        await page.setViewport({
            width: 1200,
            height: 800
        });

        let filePath = path.resolve(__dirname, 'results', dirName, 'screenshot.jpg');

        await page.screenshot({path: filePath, fullPage: true})

        await browser.close()
    }else {

        if(!process.argv[2]) {
            console.log('Вы не указали ссылку для создания скриншота')
        }

        if(!process.argv[3]) {
            console.log('Вы не указали регион')
        }
    }
})();