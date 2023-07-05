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
  bestSellers,
} from "../controllers/order.controller";

const router = express.Router();

router.get("/bestSellers/", bestSellers);
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
