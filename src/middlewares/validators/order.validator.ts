import { body } from "express-validator";

const addOrderValidator = [body("productId").isInt(), body("quantity").isInt()];
const updateOrderValidator = [body("quantity").isInt()];

export { addOrderValidator, updateOrderValidator };
