# Import dependencies
from bs4 import BeautifulSoup as bs
from splinter import Browser
import os
import pandas as pd
import time
from selenium import webdriver

def init_browser():
    executable_path = {'executable_path': '/usr/local/bin/chromedriver'}
    return Browser("chrome", **executable_path, headless = False)

def scrape():
    browser = init_browser()
    nasa_url = "https://mars.nasa.gov/news/"
    browser.visit(nasa_url)
    time.sleep(1)

    html = browser.html
    news_soup = bs(html,"html.parser")

    title = news_soup.find("div",class_="content_title").text
    article_summary = news_soup.find("div", class_="article_teaser_body").text

    print(f"Article Title: {title}")
    print(f"Summary: {article_summary}")

    image_url = "https://www.jpl.nasa.gov/spaceimages/?search=&category=Mars"
    browser.visit(image_url)
    time.sleep(1)

    browser.find_by_css('a.button').click()

    image_soup = bs(browser.html,'html.parser')
    end = image_soup.find('img',class_='fancybox-image')['src']
    JPL_image = "https://www.jpl.nasa.gov"+end

    print(JPL_image) 

    weather_url = "https://twitter.com/marswxreport?lang=en"
    browser.visit(weather_url)
    time.sleep(1)    

    html = browser.html
    weather_soup = bs(html,"html.parser")
    tweet = weather_soup.find("p", class_="TweetTextSize TweetTextSize--normal js-tweet-text tweet-text").text

    print(tweet)

    fact_url = "http://space-facts.com/mars/"
    browser.visit(fact_url)
    time.sleep(1)

    html = browser.html
    fact_soup = bs(html,"html.parser")

    table = pd.read_html(fact_url)
    table[0]

    df_mars_facts = table[0]
    df_mars_facts

    fact_html = df_mars_facts.to_html()
    fact_html = fact_html.replace("\n", "")
    fact_html

    hemi_url = "https://astrogeology.usgs.gov/search/results?q=hemisphere+enhanced&k1=target&v1=Mars"
    browser.visit(hemi_url)
    time.sleep(1)

    html = browser.html
    hemi_soup = bs(html,"html.parser")
    headers=[]
    titles = hemi_soup.find_all('h3')

    for title in titles:
        headers.append(title.text)

    images=[]
    count=0

    for thumb in headers:
        browser.find_by_css('img.thumb')[count].click()
        images.append(browser.find_by_text('Sample')['href'])
        browser.back()
        count=count+1

    hemisphere_image_urls = []
    counter = 0

    for item in images:
        hemisphere_image_urls.append({"title":headers[counter],"img_url":images[counter]})
        counter = counter+1
        data = {"News_Header":title,"News_Article":article_summary,"JPL_Image":JPL_image,"Weather":tweet,"Facts":fact_html,"Hemispheres":hemisphere_image_urls}
        return data