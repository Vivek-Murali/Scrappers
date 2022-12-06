const puppeteer = require('puppeteer')
const https = require('https')
const json = require('json')
//const path = require('path')
const axios = require('axios')
const cheerio = require('cheerio')
//const kitsu = require('kitsu')

const { KafkaConfig } = require('./common/cls.js')


const getPostTitles = async () => {
	try {
		const { data } = await axios.get(
			//'https://old.reddit.com/r/programming/'
            'https://myanimelist.net/topanime.php'
		);
		const $ = cheerio.load(data);
		const postTitles = [];

		$('div.di-ib > h3 > a').each((_idx, el) => {
			const postTitle = $(el).text()
			postTitles.push({value:postTitle})
		});

		return postTitles;
	} catch (error) {
		throw error;
	}
};

const getPostAnalysisTitles = async () => {
	try {
		const { data } = await axios.get(
			//'https://old.reddit.com/r/programming/'
            'https://anime-stats.net/anime/show/35972'
		);
		const $ = cheerio.load(data);
		const postTitles = [];

		$('h2.ds-page-title').each((_idx, el) => {
			const postTitle = $(el).text()
			postTitles.push(postTitle)
		});

		return postTitles;
	} catch (error) {
		throw error;
	}
};

async function getVisual() {
	try {
		const URL = 'https://anime-stats.net/anime/show/35972'
		const browser = await puppeteer.launch()

		const page = await browser.newPage()
		await page.goto(URL)
        const data = await page.evaluate(() => document.querySelector('*').outerHTML);
        const $ = cheerio.load(data);
		const postTitles = [];

		$('h2.ds-page-title').each((_idx, el) => {
			const postTitle = $(el).text()
			postTitles.push(postTitle)
		});
        console.log(postTitles);
		await page.screenshot({ path: 'screenshot.png' })
		await page.pdf({ path: 'page.pdf' })

		await browser.close()
	} catch (error) {
		console.error(error)
	}
}
async function main() {
        const browser = await puppeteer.launch({
            headless: false
        });
        const page = await browser.newPage();
        await page.goto('https://www.yelp.com/');
        await page.type('#find_desc', 'Pizza Delivery');
        await page.type('#dropperText_Mast', 'Toronto, ON');
        await page.click('#header-search-submit');
        await page.waitForTimeout(5000); // wait for 5 seconds
        await browser.close();
    }
//main();
//getVisual();
//getPostAnalysisTitles().then((postTitles) => console.log(postTitles));

/* const kafka = async function(){
	const kfc = new KafkaConfig();
	getPostTitles().then((postTitles) => kfc.producer("AnimeList", postTitles));
	const results = await kfc.consumer("AnimeList");
}
console.log(kafka().then(vars)); */


const kafka = new KafkaConfig();
getPostTitles().then((postTitles) => kafka.producer("AnimeList", postTitles));
kafka.consumer("AnimeList").then(data => console.log(data));


