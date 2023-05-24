import { body } from "express-validator";
import prisma from "../../utils/prisma";

const signupValidator = [
  body("email").isEmail().withMessage("الايميل غير صحيح"),

  body("password")
    .notEmpty()
    .withMessage("ادخل كلمة المرور")
    .isLength({ min: 6 })
    .withMessage("كلمة المرور لا تقل علن 6 احرف"),

  body("fName").notEmpty().withMessage("ادخل الاسم الاول"),
  body("lName").isString().withMessage("ادخل الاسم الاخير").optional(),
  body("role")
    .isIn(["CLIENT", "COMPANY", "ADMIN"])
    .withMessage("ادخل الصلاحية"),
];

const loginValidator = [
  body("email").isEmail().withMessage("الايميل غير صحيح"),
  body("password").notEmpty().withMessage("ادخل كلمة المرور"),
];

export { signupValidator, loginValidator };
