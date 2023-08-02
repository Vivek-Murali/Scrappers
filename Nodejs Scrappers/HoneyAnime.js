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
const fs = require('fs');
const { count } = require('console')

// Single Page Response
async function getVisual(url) {
	try {
		const URL = url
		const browser = await puppeteer.launch()

		const page = await browser.newPage()
		//await page.setUserAgent('Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36');
		await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/79.0.3945.0 Safari/537.36');
        await page.goto(URL)
        await page.waitForTimeout(2000); 
        //await page.screenshot({ path: 'screenshot_211.png' })
        const data = await page.evaluate(() => {
            const tableBody = document.querySelectorAll('ul li');
            return Array.from(tableBody).map(element => element.innerHTML);
        });
        const postTitles = [];
        data.forEach(function(element,idx){
            const $ = cheerio.load(element);
            const dict = {}
            dict['url'] = $("a").attr('href');
            dict['title'] = $("h3").text();
            dict['date'] = $("div[class='mb5']").text().replace(" 0","");
            dict['category'] = $("div[class='wrap-term flexbox overflow-hidden justify-content-flexstart']").text()
            dict['category_link'] = []
            $("div.wrap-term.flexbox.overflow-hidden.justify-content-flexstart a.sfont").each((index, element) => {
                const href = $(element).attr("href");
                dict['category_link'].push(href);
              });
            postTitles[idx] = dict;
        })
        const filteredData = postTitles.filter(item => item.title.trim() !== '');
        console.log(filteredData); 
		await browser.close()
	} catch (error) {
		console.error(error)
	}
}

function appendDataToFile(filename, newData) {
    // Read the existing data from the file
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) {
        // If the file doesn't exist, start with an empty array
        if (err.code === 'ENOENT') {
          data = '[]';
        } else {
          console.error('Error reading file:', err);
          return;
        }
      }
  
      // Parse the existing data as JSON
      let existingData = JSON.parse(data);
  
      // Append the new data to the existing array
      existingData.push(newData);
  
      // Convert the updated data to JSON string
      const updatedDataJson = JSON.stringify(existingData, null, 2);
  
      // Write the updated data back to the file
      fs.writeFile(filename, updatedDataJson, 'utf8', (err) => {
        if (err) {
          console.error('Error writing file:', err);
          return;
        }
        console.log('Data appended and saved successfully!');
      });
    });
}

//Multiple Page Results
async function getVisualUpdated(url,saveData="") {
    try {
        const URL = url;
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/79.0.3945.0 Safari/537.36');
        await page.goto(URL);

        //const postTitles = [];

        async function clickNextPage() {
            try {
                await page.waitForSelector('li.pagination-no-num.next a', { timeout: 7000 });
                await page.click('li.pagination-no-num.next a');
                await page.waitForTimeout(3000);
            } catch (error) {
                console.log("No more next page button found.");
            }
        }
        var count = 1

        while (true) {
            const data = await page.evaluate(() => {
                const tableBody = document.querySelectorAll('ul li');
                return Array.from(tableBody).map(element => element.innerHTML);
            });

            const pageTitles = [];
            data.forEach(function (element, idx) {
                const $ = cheerio.load(element);
                const dict = {};
                dict['url'] = $("a").attr('href');
                dict['title'] = $("h3").text();
                dict['date'] = $("div[class='mb5']").text().replace(" 0", "");
                dict['category'] = $("div[class='wrap-term flexbox overflow-hidden justify-content-flexstart']").text();
                dict['category_link'] = [];
                $("div.wrap-term.flexbox.overflow-hidden.justify-content-flexstart a.sfont").each((index, element) => {
                    const href = $(element).attr("href");
                    dict['category_link'].push(href);
                });
                pageTitles[idx] = dict;
            });
            const filteredData = pageTitles.filter(item => item.title.trim() !== '');
            appendDataToFile(saveData, filteredData)
            if (filteredData.length === 0) {
                console.log("No more posts foua.nextnd. Exiting loop.");
                break;
            }
            console.log(filteredData)
            //postTitles.concat(pageTitles)
            await clickNextPage(); // Click on the "Next Page" button.
            console.log("Page Done=>"+count.toString())
            count += 1;
        }
        await browser.close();
        /* const jsonData = JSON.stringify(postTitles, null, 2);
        fs.writeFile(saveData, jsonData, (err) => {
            if (err) {
              console.error('Error writing to the file:', err);
            } else {
              console.log('Data has been written to the file successfully.');
            }
          }); */
    } catch (error) {
        console.error(error);
    }
}
getVisualUpdated("https://honeysanime.com/allposts/","response2407.json");