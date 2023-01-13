import scrapy


class AnimePlanetAnimeSpider(scrapy.Spider):
    name = "AnimePlanetAnime"
    start_urls = [
        'https://www.anime-planet.com/anime/all',
    ]

    def parse(self, response):
        for quote in response.css('li.card'):
            yield {
                'title': quote.css('h3::text').get(),
                'link': quote.css('a::attr(href)').get(),
            }

        next_page = response.css('li.next a::attr(href)').get()
        if next_page is not None:
            next_page = response.urljoin(next_page)
            yield scrapy.Request(next_page, callback=self.parse)