import scrapy
from scrapy.linkextractors import LinkExtractor
from scrapy.spiders import CrawlSpider, Rule
import re


class MyamimelistSpider(CrawlSpider):
    name = 'MyAmimeList'
    allowed_domains = ['myanimelist.net']
    start_urls = ['https://myanimelist.net/topanime.php']
    rules = (
        Rule(LinkExtractor(restrict_xpaths="//div[@class='detail']/div/h3[@class='hoverinfo_trigger fl-l fs14 fw-b anime_ranking_h3']/a"),callback='parse',follow=True),
        Rule(LinkExtractor(restrict_xpaths="//div[@class='di-b ac pt16 pb16 pagination icon-top-ranking-page-bottom']/a"))
    )
    
    def cleanLists(self,uncleanedList:list):
        text = [re.sub('\s+',' ',idx) for idx in uncleanedList]
        text = [re.sub(',','',idx) for idx in text]
        text = [idx for idx in text if idx and idx != " "]
        return text
        
    def parse(self, response): 
        urls = ['Premiered:','Type:','Producers:','Licensors:','Studios:','Genres:','Theme:','Demographic:']
        ignore = ['Edit']
        dicts = {}
        for idx in response.xpath("//div[@id='myanimelist']/div[@class='wrapper valentine']/div[@id='contentWrapper']/div[@id='content']/table/tr/td[1]/div[@class='leftside']/div[@class='spaceit_pad']"):
            textualData = self.cleanLists(idx.xpath(".//text()").extract())
            if textualData[0] in urls:
                dictData = []
                for text,url in zip(textualData[1:],idx.xpath(".//a/@href").extract()):
                    op = {}
                    op[text]=url
                    dictData.append(op)
                dicts[textualData[0].replace(":","")] = dictData
            else:
                dicts[textualData[0].replace(":","")] =  textualData[1]  
                
        relations = []    
        for item in response.xpath("//div[@id='myanimelist']/div[@class='wrapper valentine']/div[@id='contentWrapper']/div[@id='content']/table/tr/td[2]/div/table/tr[3]/td/table[@class='anime_detail_related_anime']/tr"):
            data = {}
            text_data = item.xpath("td[@class='ar fw-n borderClass']/text()").get()
            data[text_data] = {item.xpath("td[@class='borderClass']/a/text()").get():item.xpath("td[@class='borderClass']/a/@href").get()}
            relations.append(data)
            
        links = [{idxitem.xpath("a/text()").get().replace("More ",""):idxitem.xpath("a/@href").get()} for idxitem in response.xpath("//div[@id='myanimelist']/div[@class='wrapper valentine']/div[@id='contentWrapper']/div[@id='content']/table/tr/td[2]/div/table/tr[3]/td/div/div[@class='floatRightHeader']") if idxitem.xpath("a/text()").get() not in ignore]       
        opening = []
        for idx,idxitem in enumerate(response.xpath("//div[@id='myanimelist']/div[@class='wrapper valentine']/div[@id='contentWrapper']/div[@id='content']/table/tr/td[2]/div/table/tr[3]/td/div[@class='di-t']/div[@class='di-tc va-t ']/div[@class='theme-songs js-theme-songs opnening']/table/tr")):
            data = {}
            data['index'] = idx+1
            data['title'] = idxitem.xpath("td/a/span[@class='theme-song-title']/text()").get()
            data['artist'] = idxitem.xpath("td/span[@class='theme-song-artist']/text()").get()
            data['inepisodes'] = idxitem.xpath("td/span[@class='theme-song-episode']/text()").get()
            opening.append(data)
            
        closing = []   
        for idx,idxitem in enumerate(response.xpath("//div[@id='myanimelist']/div[@class='wrapper valentine']/div[@id='contentWrapper']/div[@id='content']/table/tr/td[2]/div/table/tr[3]/td/div[@class='di-t']/div[@class='di-tc va-t ']/div[@class='theme-songs js-theme-songs ending']/table/tr")):
            data = {}
            data['index'] = idx+1
            data['title'] = idxitem.xpath("td/a/span[@class='theme-song-title']/text()").get()
            data['artist'] = idxitem.xpath("td/span[@class='theme-song-artist']/text()").get()
            data['inepisodes'] = idxitem.xpath("td/span[@class='theme-song-episode']/text()").get()
            closing.append(data)  
        
        externallinks = [{idx.xpath("div[@class='caption']/text()").get():idx.xpath("@href").get()} for idx in response.xpath("//div[@id='myanimelist']/div[@class='wrapper valentine']/div[@id='contentWrapper']/div[@id='content']/table/tr/td[1]/div[@class='leftside']/div[@class='external_links']/a")]
        streaming = [{idx.xpath("div[@class='caption']/text()").get():idx.xpath("@href").get()} for idx in response.xpath("//div[@id='myanimelist']/div[@class='wrapper valentine']/div[@id='contentWrapper']/div[@id='content']/table/tr/td[1]/div[@class='leftside']/div[@class='pb16 broadcasts']/div[@class='broadcast']/a")]
        
        otherLinks = {
                'title': response.xpath("//div/div/div[@itemprop='name']/h1/strong/text()").get(),
                'url': response.url,
                'image': {
                    'imageRepository': response.xpath("//div[@id='myanimelist']/div[@class='wrapper valentine']/div[@id='contentWrapper']/div[@id='content']/table/tr/td[1]/div[@class='leftside']/div/a/@href").get(),
                    'currentImage':response.xpath("//div[@id='myanimelist']/div[@class='wrapper valentine']/div[@id='contentWrapper']/div[@id='content']/table/tr/td[1]/div[@class='leftside']/div/a/img/@src").get()
                },
                'animeType': response.xpath("//div[@id='myanimelist']/div[@class='wrapper valentine']/div[@id='contentWrapper']/div[@id='content']/table/tr/td[2]/div/table/tr/td/div/div/div/div/div[@class='information-block di-ib clearfix']/span[@class='information type']/a/text()").get(),
                'studios':{"studioLinks":response.xpath("//div[@id='myanimelist']/div[@class='wrapper valentine']/div[@id='contentWrapper']/div[@id='content']/table/tr/td[2]/div/table/tr/td/div/div/div/div/div[@class='information-block di-ib clearfix']/span[@class='information studio author']/a/@href").getall(),
                          "studio":response.xpath("//div[@id='myanimelist']/div[@class='wrapper valentine']/div[@id='contentWrapper']/div[@id='content']/table/tr/td[2]/div/table/tr/td/div/div/div/div/div[@class='information-block di-ib clearfix']/span[@class='information studio author']/a/text()").getall()
                    },
                'premiered': response.xpath("//div[@id='myanimelist']/div[@class='wrapper valentine']/div[@id='contentWrapper']/div[@id='content']/table/tr/td[2]/div/table/tr/td/div/div/div/div/div[@class='information-block di-ib clearfix']/span[@class='information season']/a/text()").get(),
                'description': response.xpath("//div[@id='myanimelist']/div[@class='wrapper valentine']/div[@id='contentWrapper']/div[@id='content']/table/tr/td[2]/div/table/tr/td/p[@itemprop='description']/text()").get(),                
                'relatedanime':relations,
                'links':links,
                'ova':{ 'opening' :opening,
                        'ending': closing},
                "connections":externallinks,
                "streamingconnections":streaming
            }
        yield dict(list(otherLinks.items()) + list(dicts.items())) 
