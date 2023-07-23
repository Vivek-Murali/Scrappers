const puppeteer = require('puppeteer')
const https = require('https')
const json = require('json')
const axios = require('axios')
const cheerio = require('cheerio')
const request = require('request');
const URL = require('url-parse');
const Crawler = require('crawler');
const SitemapGenerator = require('sitemap-generator');
const robotsParser = require('robots-txt-parser');

async function getVisual(url) {
	try {
		const URL = url
		const browser = await puppeteer.launch()

		const page = await browser.newPage()
		//await page.setUserAgent('Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36');
		await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/79.0.3945.0 Safari/537.36');
        await page.goto(URL)
        await page.waitForTimeout(9000); 
        await page.screenshot({ path: 'screenshot_211.png' })
        const data = await page.evaluate(() => {
            const tableBody = document.querySelectorAll('ul li');
            return Array.from(tableBody).map(element => element.innerHTML);
        });
        const postTitles = [];
        data.forEach(function(element,idx){
            const $ = cheerio.load(element);
            const dict = {}
            dict['url'] = $("a[class='tooltip']").attr('href');
            dict['title'] = $("h3[cardName='cardName']").text();
            postTitles[idx] = dict;
        })


        console.log(postTitles); 


        /* const data = await page.evaluate(() => document.querySelector('*').outerHTML);
        const $ = cheerio.load(data);
		const postTitles = [];
		$("tr > td >a[ng-bind='anime.name']").each((_idx, el) => {
                console.log($(el).attr('href'));
		});
        console.log(postTitles); */
		await browser.close()
	} catch (error) {
		console.error(error)
	}
}
getVisual("https://www.anime-planet.com/anime/all");