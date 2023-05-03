import puppeteer from "puppeteer";
import cheerio from "cheerio";
import express from "express";
import bodyParser from "body-parser";
import fs from "fs";

const app = express.Router();

app.use(bodyParser.json());

app.post("/scrape-search", async (req, res) => {
  const query = req.body.query;
  console.log(query);

  const browser = await puppeteer.launch({
    headless: false,
    ignoreDefaultArgs: ["--disable-extentions"],
    args: ["--no-sandbox"],
  });

  const [eloProducts, darazProducts, ishoppingProducts] = await Promise.all([
    elo(query, browser),
    daraz(query, browser),
    ishopping(query, browser),
  ]);

  await browser.close();

  const searchResults = [
    ...darazProducts,
    ...eloProducts,
    ...ishoppingProducts,
  ];

  const jsonData = JSON.stringify(searchResults);
  fs.writeFileSync("search_data.json", jsonData);
  res.json(searchResults);
});

// app.listen(port, () => {
//   console.log(`Server sun raha hai on port ${port}`);
// });
export default app;

///////////////////////////////////////////////////////////////////////////////////

async function elo(query, browser) {
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);

  // Overrides the hieghts property
  const override = Object.assign(page.viewport(), { width: 1366 });
  await page.setViewport(override);

  // This gives an error for no height
  // const width = 1024;
  // await page.setViewport({ width: width });
  await page.setUserAgent("UA-TEST");

  const url = "https://www.exportleftovers.com/";
  await page.goto(url);

  // waiting for search bar to load
  await page.waitForSelector(
    "div.control.header__search-bar.is-relative > input"
  );
  await page.type("div.control.header__search-bar.is-relative > input", query);
  await page.keyboard.press("Enter");

  await page.waitForNavigation();
  // await page.waitForSelector(
  //   "#shopify-section-template--16146192761011__main > section > div.container.search__content > main > div.search__results-list > div"
  // );
  await page.waitForSelector("div.search__item.container.has-padding-bottom");
  //   await page.waitForSelector("div.search__item.container.has-padding-bottom");

  const html = await page.content();
  const $ = cheerio.load(html);

  const products = [];

  $("div.search__item.container.has-padding-bottom").each((index, element) => {
    const name = $(element).find("h3.search-result__title > a").text();
    const price = $(element).find("span.price > span.money").text().trim();
    const orignalprice = $(element)
      .find("span.compare-at-price > span.money")
      .text()
      .trim();
    const image = $(element)
      .find("div.image-element__wrap > img")
      .attr("data-src");
    const desc = $(element).find("div.has-padding-top > p").text().trim();
    const halflink = $(element)
      .find("h3.search-result__title > a")
      .attr("href");
    const link = "https://www.exportleftovers.com" + halflink;
    const site = "Elo";
    products.push({ name, price, orignalprice, image, desc, link, site });
  });

  // await browser.close();

  return products;
}

/////////////////////////////////////////////////////////////////////////////////////

async function daraz(query, browser) {
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);

  // Overrides the heights property
  let override = Object.assign(page.viewport(), { width: 1366 });
  await page.setViewport(override);

  // This gives an error for no height
  // const width = 1024;
  // await page.setViewport({ width: width });
  await page.setUserAgent("UA-TEST");
  const url = "https://www.daraz.pk/";
  await page.goto(url);

  // waiting for search bar to load
  await page.waitForSelector(".search-box__input--O34g");
  await page.type(".search-box__input--O34g", query);

  //waiting for the search button to show up
  await page.waitForSelector(".search-box__search--2fC5");
  await page.click(".search-box__search--2fC5");
  await page.waitForNavigation();

  const html = await page.content();
  const $ = cheerio.load(html);

  const products = [];

  $("div.inner--SODwy").each((index, element) => {
    const name = $(element).find("div.title--wFj93 > a").text().trim();
    const price = $(element).find("span.currency--GVKjl").text().trim();
    const image = $(element).find("img.image--WOyuZ ").attr("src");
    const orignalprice = $(element)
      .find("span.origPrice--AJxRs > del.currency--GVKjl")
      .text();
    const link = $(element).find("div.title--wFj93 > a").attr("href").trim();
    const site = "Daraz";

    products.push({ name, price, orignalprice, image, link, site });
  });

  // await browser.close();

  return products;
}

/////////////////////////////////////////////////////////////////////////////////////

async function ishopping(query, browser) {
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);

  // Overrides the hieghts property
  const override = Object.assign(page.viewport(), { width: 1366 });
  await page.setViewport(override);

  // This gives an error for no height
  // const width = 1024;
  // await page.setViewport({ width: width });
  await page.setUserAgent("UA-TEST");

  const url = "https://www.ishopping.pk/";
  await page.goto(url);

  // waiting for search bar to load
  await page.waitForSelector("input#search");
  await page.type("input#search", query);
  await page.keyboard.press("Enter");

  await page.waitForNavigation();
  const html = await page.content();
  const $ = cheerio.load(html);
  await page.waitForSelector("li.col-xs-6.col-sm-4.col-md-3.item");

  const products = [];

  $("li.col-xs-6.col-sm-4.col-md-3.item ").each((index, element) => {
    const name = $(element).find("h2.product-name > a").text();
    const price = $(element)
      .find("p.special-price > span.price, span.regular-price > span.price")
      .text()
      .trim();
    const oldprice = $(element).find("p.old-price > span.price").text().trim();
    const image = $(element)
      .find("div.inner-grid > a.product-image > img")
      .attr("src");
    //   const desc = $(element).find("div.has-padding-top > p").text().trim();
    const link = $(element).find("h2.product-name > a").attr("href");
    const site = "Ishopping";
    products.push({ name, price, oldprice, image, link, site });
  });
  //   console.log(JSON.stringify(products, null, 2));

  // await browser.close();
  return products;
}
