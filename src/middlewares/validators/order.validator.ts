import { body, check } from "express-validator";
import validatorMiddeleware from "./validationResult";

const addToCartValidator = [
  body("productId").isInt(),
  body("quantity").isInt(),
  validatorMiddeleware,
];
const updateOrderValidator = [
  check("quantity").isInt(),
  check("id").isInt(),
  validatorMiddeleware,
];

export { addToCartValidator, updateOrderValidator };
