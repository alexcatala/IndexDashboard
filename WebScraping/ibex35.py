from bs4 import BeautifulSoup
import requests
import re
from selenium import webdriver

URL_BASE = "http://finance.yahoo.com/quote/%5EIBEX/history?period1=729730800&period2=1491775200&interval=1d&filter=history&frequency=1d"
PARAMS = "?period1=729730800&period2=1491775200&interval=1d&filter=history&frequency=1d"

browser = webdriver.Firefox()
browser.get(URL_BASE)
print (browser.page_source)

print(browser.page_source.find('csv'))
    #html = BeautifulSoup(req.text)

    #divs = html.find_all('div', recursive=True)

    #for div in divs:
    #    print(div.get('data-reactid'))
