const puppeteer = require('puppeteer')
const https = require('https')
const json = require('json')
//const path = require('path')
const axios = require('axios')
const cheerio = require('cheerio')
const request = require('request');
const URL = require('url-parse');
//const kitsu = require('kitsu')
const Crawler = require('crawler');

const SitemapGenerator = require('sitemap-generator');
const robotsParser = require('robots-txt-parser');

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
		const URL = 'https://www.3m.com/3M/en_US/sustainability-us/' //  https://anime-stats.net/anime/show/35972
		const browser = await puppeteer.launch()

		const page = await browser.newPage()
		await page.setUserAgent('Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36');
		await page.goto(URL)
        const data = await page.evaluate(() => document.querySelector('*').outerHTML);
        const $ = cheerio.load(data);
		const postTitles = [];

		$('a').each((_idx, el) => {
			const postTitle = $(el).attr('href')
			console.log(postTitle)
			postTitles.push(postTitle)
		});
		//collectInternalLinks($)
        console.log(postTitles);
		await page.screenshot({ path: 'screenshot_213.png' })
		await page.pdf({ path: '3m1.pdf' })

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

	function crawl() {
		if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
		  console.log("Reached max limit of number of pages to visit.");
		  return;
		}
		var nextPage = pagesToVisit.pop();
		if (nextPage in pagesVisited) {
		  // We've already visited this page, so repeat the crawl
		  crawl();
		} else {
		  // New page we haven't visited
		  visitPage(nextPage, crawl);
		}
	  }
	  
	  function visitPage(url, callback) {
		// Add page to our set
		pagesVisited[url] = true;
		numPagesVisited++;
	  
		// Make the request
		console.log("Visiting page " + url);
		request(url, function(error, response, body) {
		   // Check status code (200 is HTTP OK)
		   console.log("Status code: " + response.statusCode);
		   if(response.statusCode !== 200) {
			 callback();
			 return;
		   }
		   // Parse the document body
		   var $ = cheerio.load(body);
		   var isWordFound = searchForWord($, SEARCH_WORD);
		   if(isWordFound) {
			 console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
		   } else {
			 collectInternalLinks($);
			 // In this short program, our callback is just calling crawl()
			 callback();
		   }
		});
	  }
	  
	  function searchForWord($, word) {
		var bodyText = $('html > body').text().toLowerCase();
		return(bodyText.indexOf(word.toLowerCase()) !== -1);
	  }
	  
	  function collectInternalLinks($) {
		  var relativeLinks = $("a[href^='/']");
		  console.log("Found " + relativeLinks.length + " relative links on page");
		  relativeLinks.each(function() {
			  pagesToVisit.push(baseUrl + $(this).attr('href'));
		  });
	  }

	  var START_URL = "https://www.3m.com/3M/en_US/sustainability-us/";
	  var SEARCH_WORD = "ESG";
	  var MAX_PAGES_TO_VISIT = 1000;
	  
	  var pagesVisited = {};
	  var numPagesVisited = 0;
	  var pagesToVisit = [];
	  var url = new URL(START_URL);
	  var baseUrl = url.protocol + "//" + url.hostname;
	  
	  //pagesToVisit.push(START_URL);
	  //crawl();


	  const robots = robotsParser(
		{
		  userAgent: 'Googlebot', // The default user agent to use when looking for allow/disallow rules, if this agent isn't listed in the active robots.txt, we use *.
		  allowOnNeutral: false, // The value to use when the robots.txt rule's for allow and disallow are balanced on whether a link can be crawled.
		},
	  );
	  
	robots.fetch('https://www.3m.com/robots.txt')
    .then((tree) => {
        //console.log(Object.keys(tree)); // Will log sitemap and any user agents.
    });
	robots.getSitemaps()
    .then((sitemaps) => {
        //console.log(sitemaps); // Will log an list of strings.
    });
	robots.getCrawlableLinks(['https://www.3m.com/']);

	let obselete = []; // Array of what was crawled already

let c = new Crawler();

function crawlAllUrls(url) {
    console.log(`Crawling ${url}`);
    c.queue({
        uri: url,
        callback: function (err, res, done) {
            if (err) throw err;
            let $ = res.$;
            try {
                let urls = $("a");
                Object.keys(urls).forEach((item) => {
                    if (urls[item].type === 'tag') {
                        let href = urls[item].attribs.href;
                        if (href && !obselete.includes(href)) {
                            href = href.trim();
                            obselete.push(href);
                            // Slow down the
                            setTimeout(function() {
                                href.startsWith(url) ? crawlAllUrls(href) : crawlAllUrls(`${url}${href}`) // The latter might need extra code to test if its the same site and it is a full domain with no URI
                            }, 5000)

                        }
                    }
                });
            } catch (e) {
                console.error(`Encountered an error crawling ${url}. Aborting crawl.`);
                done()

            }
            done();
        }
    })
}

//crawlAllUrls('https://www.3m.com/3M/en_US/sustainability-us/');

//console.log(obselete)
//main();
getVisual();

/* const generator = SitemapGenerator('https://www.3m.com/3M/en_US/sustainability-us', {
  stripQuerystring: false
});
 
// register event listeners
generator.on('done', () => {
  // sitemaps created
});
 
// start the crawler
generator.start(); */
//getPostAnalysisTitles().then((postTitles) => console.log(postTitles));

/* const kafka = async function(){
	const kfc = new KafkaConfig();
	getPostTitles().then((postTitles) => kfc.producer("AnimeList", postTitles));
	const results = await kfc.consumer("AnimeList");
}
console.log(kafka().then(vars)); */


//const kafka = new KafkaConfig();
//getPostTitles().then((postTitles) => kafka.producer("AnimeList", postTitles));
//kafka.consumer("AnimeList").then(data => console.log(data));

//*[@id="ssnMenu"]/li[2]/a