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

        await page.setViewport({
            width: 1100,
            height: 800
        })

        await page.waitForSelector('.Tooltip_closeIcon__skwl0')
            .then(() => console.log('"Tooltip_closeIcon__skwl0" найден'))
            .catch(e => console.log('Ошибки: '+e))

        await page.evaluate(() => {
            if(document.querySelector('.Tooltip_closeIcon__skwl0')) {

                document.querySelector('.Tooltip_closeIcon__skwl0').click()

                if(document.querySelector('.Region_region__6OUBn')) {
                    document.querySelector('.Region_region__6OUBn').click()
                }
            }
        })

        await page.waitForSelector('.UiRegionListBase_list__cH0fK')
            .then(() => console.log('"UiRegionListBase_list__cH0fK" найден'))
            .catch(e => console.log('Ошибки: '+e))

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

        await page.waitForSelector('.ProductPage_informationBlock__vDYCH')
            .then(() => console.log('"ProductPage_informationBlock__vDYCH" найден'))
            .catch(e => console.log('Ошибки: '+e))

        const productFileContent = await page.evaluate(() => {

            let price, priceOld, rating, reviewCount;

            let re = new RegExp(String.fromCharCode(160), "g")
            let block = document.querySelector('.ProductPage_informationBlock__vDYCH')

            if(block) {

                if(block.querySelector('.Price_role_regular__X6X4D')) {

                    price = block.querySelector('.Price_role_regular__X6X4D').textContent.split(' ')[0].replace(',', '.').replace(re, ' ');
                    priceOld = undefined
                }else {

                    if(block.querySelector('.Price_role_discount__l_tpE')) {

                        price = block.querySelector('.Price_role_discount__l_tpE').textContent.split(' ')[0].replace(',', '.').replace(re, ' ');
                    }else {
                        price = undefined
                    }

                    if(block.querySelector('.Price_role_old__r1uT1')) {
                        priceOld = block.querySelector('.Price_role_old__r1uT1').textContent.split(' ')[0].replace(',', '.').replace(re, ' ');
                    }else {
                        priceOld = undefined
                    }
                }
            }else {

                price = undefined
                priceOld = undefined
            }

            if(document.querySelector('.ActionsRow_stars__EKt42')) {

                rating = document.querySelector('.ActionsRow_stars__EKt42').textContent.replace(re, ' ');
            }else {
                rating = undefined
            }

            if(document.querySelector('.ActionsRow_reviews__AfSj_')) {

                reviewCount = document.querySelector('.ActionsRow_reviews__AfSj_').textContent.split(' ')[0].replace(re, ' ')
            }else {
                reviewCount = undefined
            }

            return {
                price: price,
                priceOld: priceOld,
                rating: rating,
                reviewCount: reviewCount,
            }
        })

        let fileText = `price=${productFileContent.price}
priceOld=${productFileContent.priceOld}
rating=${productFileContent.rating}
reviewCount=${productFileContent.reviewCount}`;

        let dirName = region

        if(dirName.toString().slice(-1) == '.') {
            dirName = region.slice(0, -1)
        }

        if(!fs.existsSync(path.resolve(__dirname, 'results', dirName))) {
            fs.mkdirSync(path.resolve(__dirname, 'results', dirName), { recursive: true });
        }

        fs.writeFile(path.resolve(__dirname, 'results', dirName, 'product.txt'), fileText, (err) => {if(err) {throw err;}});

        await page.evaluate(() => {

            window.scrollTo(0, document.body.scrollHeight);
        })

        await page.waitForSelector('.ProductCarousel_header__v3QzP')
            .then(() => console.log('"ProductCarousel_header__v3QzP" найден'))
            .catch(e => console.log('Ошибки: '+e))

        await page.evaluate(() => {

            if(document.querySelector('.UiHeaderHorizontalBase_headerPortal__hNBbM')) {
                document.querySelector('.UiHeaderHorizontalBase_headerPortal__hNBbM').remove()
            }

            if(document.querySelector('.OutlineButton_color_primary___NYOX')) {
                document.querySelector('.OutlineButton_color_primary___NYOX').click()
            }
        })

        await page.waitForSelector('.UiFooterHorizontalBase_footer__Pysr9')
            .then(() => console.log('"UiFooterHorizontalBase_footer__Pysr9" найден'))
            .catch(e => console.log('Ошибки: '+e))

        await page.evaluate(() => {
            if(document.querySelector('.UiFooterHorizontalBase_footer__Pysr9')) {
                document.querySelector('.UiFooterHorizontalBase_footer__Pysr9').click()
                console.log('footer прогрузился')
            }else {
                console.log('footer не прогрузился')
            }
        })

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