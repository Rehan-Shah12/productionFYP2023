import express from "express";
import { getExternalProducts } from "../controllers/scraperController.js";

const router = express.Router();

// Get Product from JSON

router.get("/search", getExternalProducts);

// Get Product through Scraping

// router.post("/scrape-search", )

export default router;
