import scrapeProducts from "../search_data.json" assert { type: "json" };

export const getExternalProducts = async (req, res) => {
  try {
    res.status(200).json(scrapeProducts);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In Getting Scraped Products",
      error,
    });
  }
};
