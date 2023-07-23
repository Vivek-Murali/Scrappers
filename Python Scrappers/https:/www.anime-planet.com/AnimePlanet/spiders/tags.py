import scrapy
from scrapy.linkextractors import LinkExtractor
from scrapy.spiders import CrawlSpider, Rule

class AnimePlanetAnimeSpider(CrawlSpider):
    name = "AnimePlanetAnime"
    allowed_domains = ["anime-planet.com"]
    start_urls = ['https://www.anime-planet.com/anime/all']
    
    rules = (
        Rule(LinkExtractor(restrict_xpaths="//div[@class='pagination aligncenter']/ul/li[@class='next']/a")),
        #Rule(LinkExtractor(restrict_xpaths="//ul[@class='cardDeck cardGrid']/li/a"),callback='parse',follow=True),
        #Rule(LinkExtractor(restrict_xpaths="//*[@id='siteContainer']/div[3]/ul/li[15]/a"))
    )

    
    def parse(self, response):
        yield {
                'title': response.xpath("//h1[@itemprop='name']/text()").get(),
                'url': response.url,
                'animeType': response.xpath("//div[@class='pure-1 md-1-5']/span[@class='type']/text()").get(),
                'studio': response.xpath("//section[@class='pure-g entryBar']/div[2]/a/@href").getall(),
                'year': response.xpath("//div[@class='pure-1 md-1-5']/span[@class='iconYear']/text()").get(),
                "rating":response.xpath("//div[@class='pure-1 md-1-5']/div[@class='avgRating']/span/text()").get(),
                "currentRank": response.xpath("//section[@class='pure-g entryBar']/div[5]/text()").get(),
                "tags":response.xpath("//div[@class='pure-1 md-3-5']/div[@class='tags ']/ul/li/a/text()").getall(),
                "waringNote":response.xpath("//div[@class='pure-1 md-3-5']/div[@class='tags tags--plain']/ul/li/a/text()").getall(),
                "image":response.xpath("//div[@class='mainEntry']/img/@src").get(),
                "recommandationurl":response.xpath("//div[@class='tabs reco-tabs ui-tabs ui-widget ui-widget-content ui-corner-all']/div/a/@href").get(),
                "reviewurl":response.xpath("//section[2]/div[3]/a[@class='macro_button macro_button--secondary']/@href").get(),
                "staffurl":response.xpath("//section[@class='EntryPage__content__section EntryPage__content__section__staff castaff']/a/@href").get(),
                "charurl":response.xpath("//section[@class='EntryPage__content__section EntryPage__content__section__characters castaff']/a/@href").get(),
                "connections":response.xpath("//div[@id='tabs--relations--anime']/div/div/a/@href").getall(),
                "mangaconnections":response.xpath("//div[@id='tabs--relations--manga']/div/div/a/@href").getall()
            }