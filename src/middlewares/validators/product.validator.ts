import { body, check } from "express-validator";
import validatorMiddeleware from "./validationResult";

const addProductValidator = [
  body("nameEn").notEmpty().withMessage("ادخل اسم المنتج باللغة الانجليزية"),
  body("nameAr").notEmpty().withMessage("ادخل اسم المنتج باللغة العربية"),
  body("price").isFloat().withMessage("ادخل  سعر المنتج"),
  body("descriptionEn")
    .isString()
    .withMessage(" ادخل  وصف المنتج باللغة الانجليزية")
    .optional(),
  body("descriptionAr")
    .isString()
    .withMessage(" ادخل  وصف المنتج باللغة العربية")
    .optional(),
  body("subCategoryId").isInt().withMessage("ادخل تصنيف المنتج"),
  body("quantity").isInt().optional(),
  validatorMiddeleware,
];

const updateProductValidator = [
  body("nameEn").isString().optional(),
  body("nameAr")
    .isString()
    .withMessage("ادخل اسم المنتج باللغة العربية")
    .optional(),
  body("price").isFloat().withMessage("ادخل  سعر المنتج").optional(),
  body("descriptionEn")
    .isString()
    .withMessage(" ادخل  وصف المنتج باللغة الانجليزية")
    .optional(),
  body("descriptionAr")
    .isString()
    .withMessage(" ادخل  وصف المنتج باللغة العربية")
    .optional(),
  body("subCategoryId").isInt().withMessage("ادخل تصنيف المنتج").optional(),
  body("quantity").isInt().optional(),
  validatorMiddeleware,
];

const productFilter = [
  check("subCategoriesIdes").isArray().withMessage(""),
  check("subCategoriesIdes.*")
    .not()
    .isString()
    .isInt()
    .withMessage("subCategoriesIdes must be array of integers"),
  validatorMiddeleware,
];

const getByIdValidator = [
  check("id").isInt().withMessage("productId must be integer"),
  validatorMiddeleware,
];

export {
  addProductValidator,
  updateProductValidator,
  productFilter,
  getByIdValidator,
};
