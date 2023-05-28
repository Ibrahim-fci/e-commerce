import express from "express";
import { addProduct } from "../controllers/product.controller";
import { authorize } from "../middlewares/authentication/auth";
import { addProductValidator } from "../middlewares/validators/product.validator";
import { productUpload } from "../utils/multer";

const router = express.Router();

router.post(
  "/",
  authorize,
  productUpload.single("image"),
  addProductValidator,
  addProduct
);

export default router;
