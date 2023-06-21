import express from "express";
import * as categoryController from "../controllers/category.controller";
import { authorize } from "../middlewares/authentication/auth";
import * as categoryValidator from "../middlewares/validators/category.validator";

const router = express.Router();

router
  .route("/")
  .get(categoryController.getCategories)
  .post(
    authorize,
    categoryValidator.categoryValidator,
    categoryController.addCategory
  );

// @desc update category
router.put(
  "/:id",
  authorize,
  categoryValidator.updateCategoryValidator,
  categoryController.updateCategory
);
router.post(
  "/subCategory/",
  authorize,
  categoryValidator.subCategoryValidator,
  categoryController.addSubCategory
);

// @desc update subCategory
router.put(
  "/subCategory/:id",
  authorize,
  categoryValidator.updateSubCategoryValidator,
  categoryController.updateSubCategory
);

export default router;
