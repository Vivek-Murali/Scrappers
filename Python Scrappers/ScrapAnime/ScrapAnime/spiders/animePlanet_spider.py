import scrapy
from scrapy_splash import SplashRequest


class AnimePlanetAnimeSpider(scrapy.Spider):
    name = "AnimePlanetAnime"
    #start_urls = ['https://www.anime-planet.com/anime/all',]
    
    script='''fucntion main(splash,args)
                url=args.url
                assert(splash:go(url))
                return splash:html()
                end'''
                
    def start_request(self):
        yield SplashRequest(url="https://anime-stats.net/anime/all-anime", callback=self.parse, endpoint="execute", args={'lua_source':self.script,'wait': 0.5})
    

    def parse(self, response):
        yield {
            "body":response.body
        }
        """ for quote in response.css('li.card'):
            yield {
                'title': quote.css('h3::text').get(),
                'link': quote.css('a::attr(href)').get(),
            }

        next_page = response.css('li.next a::attr(href)').get()
        if next_page is not None:
            next_page = response.urljoin(next_page)
            yield scrapy.Request(next_page, callback=self.parse) """