import express from "express";
import {
  addProduct,
  updateProduct,
  deleteProduct,
  allProduct,
} from "../controllers/product.controller";
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

router.get("/", allProduct);

router.delete("/:id", authorize, deleteProduct);
export default router;
