import { body } from "express-validator";

const categoryValidator = [
  body("nameEn")
    .isString()
    .notEmpty()
    .withMessage("ادخل الاسم باللغة الانجليزية"),
  body("nameAr").isString().notEmpty().withMessage("ادخل الاسم باللغة العربية"),
];

const updateCategoryValidator = [
  body("nameEn")
    .isString()
    .withMessage("ادخل الاسم باللغة الانجليزية")
    .optional(),
  body("nameAr").isString().withMessage("ادخل الاسم باللغة العربية").optional(),
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
];

export {
  categoryValidator,
  subCategoryValidator,
  updateCategoryValidator,
  updateSubCategoryValidator,
};
