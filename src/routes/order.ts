import express from "express";

import {
  addToCartValidator,
  updateCartItemValidator,
  createOrderValidator,
} from "../middlewares/validators/order.validator";
import { authorize } from "../middlewares/authentication/auth";
import {
  addToCart,
  updateCartItem,
  deleteCartItem,
  createOrder,
  getCartItems,
  bestSellers,
  cartItemsNum,
} from "../controllers/order.controller";

const router = express.Router();

router.get("/bestSellers/", bestSellers);
router.get("/cart/", authorize, getCartItems);
router.get("/cart-items-num/", authorize, cartItemsNum);
router.post("/addToCart/", authorize, addToCartValidator, addToCart);
router.put(
  "/cart-items/:id",
  authorize,
  updateCartItemValidator,
  updateCartItem
);
router.delete("/cart-items/:id", authorize, deleteCartItem);
router.post("/", authorize, createOrderValidator, createOrder);

export default router;
