import express from "express";
import * as productController from "../controllers/product.controller";
import { authorize } from "../middlewares/authentication/auth";
import * as productValidator from "../middlewares/validators/product.validator";
import { productUpload } from "../utils/multer";

const router = express.Router();

router.post(
  "/",
  authorize,
  productUpload.single("image"),
  productValidator.addProductValidator,
  productController.addProduct
);

router.put(
  "/:id",
  authorize,
  productUpload.single("image"),
  productValidator.updateProductValidator,
  productController.updateProduct
);

router.get("/", productController.allProduct);
router.get(
  "/by-id/:id",
  productValidator.getByIdValidator,
  productController.getProductById
);
router.delete("/:id", authorize, productController.deleteProduct);

router.get(
  "/filter/",
  productValidator.productFilter,
  productController.productFilter
);

router.get(
  "/user-products-filter/",
  authorize,
  productValidator.productFilter,
  productController.userProducts
);
export default router;
