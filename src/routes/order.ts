import express from "express";

import {
  addOrderValidator,
  updateOrderValidator,
} from "../middlewares/validators/order.validator";
import { authorize } from "../middlewares/authentication/auth";
import { addToCart, bestSellers } from "../controllers/order.controller";

const router = express.Router();

// router.post("/", authorize, addOrderValidator, makeOrder);
// router.put("/:id", authorize, updateOrderValidator, updateOrder);
// router.delete("/:id", authorize, deleteOrder);
router.get("/bestSellers/", bestSellers);

router.post("/addToCart/", authorize, addToCart);

export default router;
