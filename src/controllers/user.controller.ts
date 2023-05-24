import prisma from "../utils/prisma";
import { validationResult } from "express-validator";
import { encryptText, decryptText } from "../utils/encrypt-decrypt";
import { generateAccessToken } from "../utils/jwt";

let host = "http://localhost:8000/";

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
      role: req.body.role,
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

async function updateProfile(req: any, res: any) {
  /// validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  //get user from req
  let user = req.user;

  // get datat from request body
  let data = req.body;

  try {
    let profile = await prisma.profile.findUnique({
      where: {
        userId: user.id,
      },
    });

    let updatedProfile = await prisma.profile.update({
      where: {
        userId: user.id,
      },
      data: {
        bio: data.bio ? data.bio : profile?.bio,
        fName: data.fName ? data.fName : profile?.fName,
        lName: data.lName ? data.lName : profile?.lName,
        phoneNum: data.phoneNum ? data.phoneNum : profile?.phoneNum,
        country: data.country ? data.country : profile?.country,
        city: data.city ? data.city : profile?.city,
        address: data.address ? data.address : profile?.address,
        url: req.file
          ? `${host}/images/profiles/` + req.file.filename
          : profile?.url,
      },
    });

    return res
      .status(200)
      .json({ msg: "تم تعديل البيانات بنجاح", profile: updatedProfile });
  } catch {
    return res.status(400).json({ msg: "تأكد من صحة البيانات" });
  }
}

export { signup, login, updateProfile };
