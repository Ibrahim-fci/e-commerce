import prisma from "../utils/prisma";
import { validationResult } from "express-validator";
import { encryptText, decryptText } from "../utils/encrypt-decrypt";
import { generateAccessToken } from "../utils/jwt";

async function signup(req: any, res: any) {
  /// validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  // check email existed before or not
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (user) return res.status(400).json({ mesg: "المستخدم موجود بالفعل" });
  } catch {}

  //// create a new user
  const user = await prisma.user.create({
    data: {
      email: req.body.email,
      fullName: req.body.fName + " " + req.body.lName,
      password: await encryptText(req.body.password),
    },
  });

  ///create a user  profile
  const profile = await prisma.profile.create({
    data: {
      fName: req.body.fName,
      lName: req.body.lName,
      userId: user.id,
    },
  });
  /// return success method
  return res.status(201).json({ mesg: "تم تسجيل المستخدم بنجاح" });
}

async function login(req: any, res: any) {
  /// validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  // check if user email existed or not

  const user = await prisma.user.findFirst({
    where: {
      email: req.body.email,
    },
  });

  //
  if (!user) return res.status(404).json({ msg: "المستخدم غير موجود" });

  // compare user pasword

  if (!(await decryptText(req.body.password, user.password)))
    return res
      .status(400)
      .json({ msg: "بريد غير صحيح او كلمة مرور غير صحيحة" });

  let token = await generateAccessToken({ id: user.id, email: user.email });

  return res.status(200).json({ msg: "تم الدخول بنجاح", token: token });
}

export { signup, login };
