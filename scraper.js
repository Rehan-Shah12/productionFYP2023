import puppeteer from "puppeteer";
import { load } from "cheerio";
import express from "express";
import bodyParser from "body-parser";
import fs from "fs";

const app = express.Router();

app.use(bodyParser.json());

app.post("/scrape-search", async (req, res) => {
  console.log("scrape-search started");
  console.time("scrape-search");
  const query = req.body.query;
  console.log(query);

  const browser = await puppeteer.launch({
    headless: "new",
    ignoreDefaultArgs: ["--disable-extentions"],
    args: ["--no-sandbox"],
  });
  console.time("browser launch");

  const [eloProducts, darazProducts, ishoppingProducts] = await Promise.all([
    elo(query, browser),
    daraz(query, browser),
    ishopping(query, browser),
  ]);
  console.timeEnd("browser launch");

  await browser.close();
  console.timeEnd("scrape-search");

  const searchResults = [
    ...darazProducts,
    ...eloProducts,
    ...ishoppingProducts,
  ];
  console.timeEnd("scrape-search");

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
  console.log("elo started");
  console.time("elo");

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);

  const override = Object.assign(page.viewport(), { width: 1366 });
  await page.setViewport(override);

  await page.setUserAgent("UA-TEST");

  const url = `https://www.exportleftovers.com/search?q=${query}`;
  await page.goto(url);

  await page.waitForSelector("div.search__item.container.has-padding-bottom");

  const html = await page.content();
  const $ = load(html);

  const products = [];

  $("div.search__item.container.has-padding-bottom:lt(10)").each(
    (index, element) => {
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
    }
  );
  console.timeEnd("elo");
  return products;
}

/////////////////////////////////////////////////////////////////////////////////////

async function daraz(query, browser) {
  console.log("Daraz started");
  console.time("Daraz");
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);

  // Overrides the heights property
  let override = Object.assign(page.viewport(), { width: 1366 });
  await page.setViewport(override);

  // This gives an error for no height
  // const width = 1024;
  // await page.setViewport({ width: width });
  await page.setUserAgent("UA-TEST");

  const url = `https://www.daraz.pk/catalog/?q=${encodeURIComponent(query)}`;
  await page.goto(url);

  const html = await page.content();
  const $ = load(html);

  const products = [];
  await page.waitForSelector("div.inner--SODwy");

  $("div.inner--SODwy:lt(10)").each((index, element) => {
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

  console.timeEnd("Daraz");

  return products;
}

/////////////////////////////////////////////////////////////////////////////////////

async function ishopping(query, browser) {
  console.log("ishopping started");
  console.time("ishopping");
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);

  // Overrides the hieghts property
  const override = Object.assign(page.viewport(), { width: 1366 });
  await page.setViewport(override);

  // This gives an error for no height
  // const width = 1024;
  // await page.setViewport({ width: width });
  await page.setUserAgent("UA-TEST");

  const url = `https://www.ishopping.pk/catalogsearch/result/?q=${query}`;
  await page.goto(url);

  const html = await page.content();
  const $ = load(html);
  await page.waitForSelector("li.col-xs-6.col-sm-4.col-md-3.item");

  const products = [];

  $("li.col-xs-6.col-sm-4.col-md-3.item:lt(10) ").each((index, element) => {
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

  console.timeEnd("ishopping");

  return products;
}
