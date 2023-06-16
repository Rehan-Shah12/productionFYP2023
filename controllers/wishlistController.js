import slugify from "slugify";
import wishlistModel from "../models/wishlistModel.js";
import userModel from "../models/userModel.js";

export const addToWishlist = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.user);
    const userId = req.user._id;
    const { productId } = req.body;
    const wishlist = await wishlistModel.findOne({ userId });

    if (wishlist) {
      if (wishlist.products.includes(productId)) {
        return res
          .status(400)
          .json({ message: "Product already added to wishlist" });
      }

      wishlist.products.push(productId);
      await wishlist.save();

      return res.status(200).json({ message: "Product added to wishlist" });
    }

    const newWishlist = new wishlistModel({
      userId,
      products: [productId],
    });

    await newWishlist.save();

    const user = await userModel.findById(userId);
    user.wishlist = newWishlist._id;
    await user.save();

    return res.status(200).json({ message: "Product added to favorites" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//Update WishList
export const removeFromWishlist = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;

    const wishlist = await wishlistModel.findOne({ userId });

    // Remove the product ID from the favorites document's products array
    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    // Save the updated user and favorites document
    await wishlist.save();

    res.status(200).json({ message: "Removed from Favorites" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
//Get All Products from wishlist
export const getWishlist = async (req, res) => {
  try {
    console.log(req.user);
    const wishlist = await wishlistModel
      .find({ userId: req.user._id })
      .populate("products");
    // console.log(favorites);
    res.json({ wishlist });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
