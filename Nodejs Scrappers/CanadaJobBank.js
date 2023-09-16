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

const { KafkaConfig } = require('./common/cls.js')


function getCurrentDate(){
    var today = (new Date()).toString().split(' ').splice(1,3).join(' ');
    return today;
}


async function getVisual(role) {
	try {
        // Home page
		const MainURL = "https://www.jobbank.gc.ca/findajob/foreign-candidates"
		const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.setUserAgent('Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36');
		await page.goto(MainURL)
        await page.waitForTimeout(5000); 
        
        //Handing External Window
        try {
            await page.waitForSelector('div[class="mfp-content"]', { timeout: 7000 });
            await page.click('a[class="btn btn-default popup-modal-dismiss float-left"]');
            await page.waitForTimeout(3000);
            console.log("Window found and Clicked!!")
        } catch (error) {
            console.log("No Window Found");
        }

        // Submitting Form
        await page.type('input[name=searchstring]', role, {delay: 200})
        await page.click('button[class="btn btn-primary')
        await page.waitForTimeout(5000);
        // await page.screenshot({ path: 'screenshot_414.png' })
		
		// Capturing Data
        const data = await page.evaluate(() => {
            const tableBody = document.querySelectorAll('article');
            return Array.from(tableBody).map(element => element.innerHTML);
        });


        var CurrentDate = getCurrentDate();
        const postTitles = [];
        data.forEach(function(element,idx){
            const $ = cheerio.load(element);
            const dict = {}
            dict['url'] = "https://www.jobbank.gc.ca"+$("a[class='resultJobItem']").attr('href').split(";")[0]+"?source=searchresults";
            dict['title'] = $("h3 span[class='noctitle']").text().split("\n")[0].trim();
            dict["business"] = $("ul[class='list-unstyled'] li[class='business']").text().trim(); 
            dict["location"] = $("ul[class='list-unstyled'] li[class='location']").text().split("  ")[1].trim(); 
            dict["salary"] = $("ul[class='list-unstyled'] li[class='salary']").text().split(":")[1].trim(); 
            dict["job_number"] = $("ul[class='list-unstyled'] li[class='source']").text().split(":")[1].trim(); 
            dict["post_date"] = $("ul[class='list-unstyled'] li[class='date']").text().trim(); 
            dict["date_captured"] = CurrentDate;
            postTitles[idx] = dict;
        })

        console.log(postTitles); 
		await browser.close()
	} catch (error) {
		console.error(error)
	}
}

// https://www.jobbank.gc.ca/jobsearch/jobsearch?searchstring=Data+Engineering&locationstring=&fglo=1&sort=M
getVisual("Data Scientist");

