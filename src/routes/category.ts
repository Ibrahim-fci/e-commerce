import express from "express";
import * as categoryController from "../controllers/category.controller";
import { authorize } from "../middlewares/authentication/auth";
import * as categoryValidator from "../middlewares/validators/category.validator";
import { categoryUpload, subCategoryUpload } from "../utils/multer";

const router = express.Router();

router
  .route("/")
  .get(categoryController.getCategories)
  .post(
    authorize,
    categoryUpload.single("image"),
    categoryValidator.categoryValidator,
    categoryController.addCategory
  );

// @desc update category
router.put(
  "/:id",
  authorize,
  categoryUpload.single("image"),
  categoryValidator.updateCategoryValidator,
  categoryController.updateCategory
);
router.post(
  "/subCategory/",
  authorize,
  subCategoryUpload.single("image"),
  categoryValidator.subCategoryValidator,
  categoryController.addSubCategory
);

// @desc update subCategory
router.put(
  "/subCategory/:id",
  authorize,
  subCategoryUpload.single("image"),
  categoryValidator.updateSubCategoryValidator,
  categoryController.updateSubCategory
);

export default router;
