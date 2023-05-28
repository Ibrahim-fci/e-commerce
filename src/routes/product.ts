import express from "express";
import { addProduct, updateProduct } from "../controllers/product.controller";
import { authorize } from "../middlewares/authentication/auth";
import {
  addProductValidator,
  updateProductValidator,
} from "../middlewares/validators/product.validator";
import { productUpload } from "../utils/multer";

const router = express.Router();

router.post(
  "/",
  authorize,
  productUpload.single("image"),
  addProductValidator,
  addProduct
);

router.put(
  "/:id",
  authorize,
  productUpload.single("image"),
  updateProductValidator,
  updateProduct
);
export default router;
