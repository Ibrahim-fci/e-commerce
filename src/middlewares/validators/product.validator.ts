import { body } from "express-validator";

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
];

export { addProductValidator };
