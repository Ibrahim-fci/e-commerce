import { body, check } from "express-validator";
import validatorMiddeleware from "./validationResult";

const addToCartValidator = [
  body("productId").isInt(),
  body("quantity").isInt(),
  validatorMiddeleware,
];
const updateCartItemValidator = [
  check("quantity").isInt(),
  check("id").isInt(),
  validatorMiddeleware,
];

const createOrderValidator = [
  check("deliveryAddress").isString(),
  check("cartItemsIdes").isArray().withMessage("").optional(),
  validatorMiddeleware,
];

export { addToCartValidator, updateCartItemValidator, createOrderValidator };
