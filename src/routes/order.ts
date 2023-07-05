import express from "express";

import {
  addToCartValidator,
  updateOrderValidator,
} from "../middlewares/validators/order.validator";
import { authorize } from "../middlewares/authentication/auth";
import {
  addToCart,
  updateCartItem,
  deleteCartItem,
  bestSellers,
} from "../controllers/order.controller";

const router = express.Router();

// router.post("/", authorize, addOrderValidator, makeOrder);
router.get("/bestSellers/", bestSellers);
router.post("/addToCart/", authorize, addToCartValidator, addToCart);
router.put("/cart-items/:id", authorize, updateOrderValidator, updateCartItem);
router.delete("/cart-items/:id", authorize, deleteCartItem);

export default router;
