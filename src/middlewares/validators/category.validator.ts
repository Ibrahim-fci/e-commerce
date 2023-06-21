import { body } from "express-validator";
import validatorMiddeleware from "./validationResult";

const categoryValidator = [
  body("nameEn")
    .isString()
    .notEmpty()
    .withMessage("ادخل الاسم باللغة الانجليزية"),
  body("nameAr").isString().notEmpty().withMessage("ادخل الاسم باللغة العربية"),
  validatorMiddeleware,
];

const updateCategoryValidator = [
  body("nameEn")
    .isString()
    .withMessage("ادخل الاسم باللغة الانجليزية")
    .optional(),
  body("nameAr").isString().withMessage("ادخل الاسم باللغة العربية").optional(),
  validatorMiddeleware,
];

const subCategoryValidator = [
  body("nameEn")
    .isString()
    .notEmpty()
    .withMessage("ادخل الاسم باللغة الانجليزية"),
  body("nameAr").isString().notEmpty().withMessage("ادخل الاسم باللغة العربية"),
  body("categoryId").isInt().notEmpty(),
];

const updateSubCategoryValidator = [
  body("nameEn")
    .isString()
    .withMessage("ادخل الاسم باللغة الانجليزية")
    .optional(),
  body("nameAr").isString().withMessage("ادخل الاسم باللغة العربية").optional(),
  body("categoryId").isInt().optional(),
  validatorMiddeleware,
];

export {
  categoryValidator,
  subCategoryValidator,
  updateCategoryValidator,
  updateSubCategoryValidator,
};
