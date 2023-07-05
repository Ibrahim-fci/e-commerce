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
  validatorMiddeleware,
];

export { addToCartValidator, updateCartItemValidator, createOrderValidator };
