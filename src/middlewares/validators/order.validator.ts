import { body } from "express-validator";
import validatorMiddeleware from "./validationResult";

const addOrderValidator = [
  body("productId").isInt(),
  body("quantity").isInt(),
  validatorMiddeleware,
];
const updateOrderValidator = [body("quantity").isInt(), validatorMiddeleware];

export { addOrderValidator, updateOrderValidator };
