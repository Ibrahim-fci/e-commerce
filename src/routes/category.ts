import express from "express";
import {
  addCategory,
  updateCategory,
  addSubCategory,
  updateSubCategory,
} from "../controllers/category.controller";
import { authorize } from "../middlewares/authentication/auth";
import {
  categoryValidator,
  subCategoryValidator,
  updateCategoryValidator,
  updateSubCategoryValidator,
} from "../middlewares/validators/category.validator";

const router = express.Router();

router.post("/", authorize, categoryValidator, addCategory);
router.put("/:id", authorize, updateCategoryValidator, updateCategory);
router.post("/subCategory/", authorize, subCategoryValidator, addSubCategory);
router.put("/:id", authorize, updateSubCategoryValidator, updateSubCategory);

export default router;
