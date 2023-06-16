import express from "express";
import { isAdmin, requireSignIn } from "./../middlewares/authMiddleware.js";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";

const router = express.Router();

// Create Category
router.post("/add-to-wishlist", requireSignIn, addToWishlist);

// // Update Category
// router.put(
//   "/update-category/:id",
//   requireSignIn,
//   isAdmin,
//   updateCategoryController
// );

// // GetAll Categories
router.get("/get-wishlist", requireSignIn, getWishlist);

// // Get Single Category
// router.get("/single-category/:slug", singleCategoryController);

// // Delete Category

router.delete("/remove-from-wishlist/:id", requireSignIn, removeFromWishlist);

export default router;
