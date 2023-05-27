import { body } from "express-validator";

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

const ProfileValidator = [
  body("bio").isString().withMessage("السيرة الشخصية نص").optional(),
  body("fName").isString().withMessage(" ادخل الاسم الاول نص").optional(),
  body("lName").isString().withMessage("ادخل الاسم الاخير نص").optional(),
  body("phoneNum")
    .isLength({ min: 10 })
    .optional()
    .withMessage("رقم الموبايل اكبر من 10 ارقام"),
  body("country").isString().withMessage("ادخل اسم الدولة نص").optional(),
  body("city").isString().withMessage("ادخل اسم المحافظة نص").optional(),
  body("address").isString().withMessage("ادخل  العنوان نص").optional(),
];

export { signupValidator, loginValidator, ProfileValidator };
