import prisma from "../utils/prisma";
import { encryptText, decryptText } from "../utils/encrypt-decrypt";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";

import { getUser } from "../helpers/user.helper";

let host = "http://localhost:8000/";

async function createNewUser(req: any, res: any) {
  let user = { id: 0, email: "" };
  //generate Token
  let token = await generateAccessToken({
    id: req.body.id,
    email: req.body.emai,
  });
  try {
    if (req.body.type == "normal") {
      if (!req.body.password)
        return res.status(400).json({ msg: "ادخل  كلمة المرور" });
      //// create a new user
      user = await prisma.user.create({
        data: {
          email: req.body.email,
          fullName:
            req.body.fName + " " + (req.body.lName ? req.body.lName : ""),
          password: await encryptText(req.body.password),
          role: req.body.role,
        },
      });
    } else if (req.body.type == "social") {
      //// create a new user
      user = await prisma.user.create({
        data: {
          email: req.body.email,
          fullName:
            req.body.fName + " " + (req.body.lName ? req.body.lName : ""),
          // password: "",
          role: req.body.role,
        },
      });
    }

    ///create a user  profile
    const profile = await prisma.profile.create({
      data: {
        fName: req.body.fName,
        lName: req.body.lName,
        userId: user.id,
      },
    });

    //getUser
    let createdUser = await getUser(user.email, user.id);
    /// return success method
    return res.status(201).json({
      msg: "تم تسجيل المستخدم بنجاح",
      token: token,
      user: createdUser,
    });
  } catch {
    return res.status(400).json({ msg: "somthing went wrong" });
  }
}

async function signup(req: any, res: any) {
  // check email existed before or not
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (user) return res.status(400).json({ msg: "المستخدم موجود بالفعل" });
  } catch {}

  //fun to create a new user
  await createNewUser(req, res);
}

async function login(req: any, res: any) {
  // check if user email existed or not
  const user = await prisma.user.findFirst({
    where: {
      email: req.body.email,
    },
  });

  if (!user) return res.status(404).json({ msg: "المستخدم غير موجود" });
  let createdUser = await getUser(user.email, user.id);

  //generate token
  let token = await generateAccessToken({ id: user.id, email: user.email });
  let refreshToken = await generateRefreshToken({
    id: user.id,
    email: user.email,
  });

  if (req.body.type == "social") {
    return res.status(200).json({
      msg: "تم الدخول بنجاح",
      token: token,
      user: createdUser,
      // refreshToken: refreshToken,
    });
  }

  //else normal login (check if there is password or not  and compare passowrd)

  if (!req.body.password)
    return res.status(400).json({ msg: "ادخل كلمة المرور" });

  // compare user pasword
  if (!(await decryptText(req.body.password, user.password)))
    return res
      .status(400)
      .json({ msg: "بريد غير صحيح او كلمة مرور غير صحيحة" });

  return res
    .status(200)
    .json({ msg: "تم الدخول بنجاح", token: token, user: createdUser });
}

async function updateProfile(req: any, res: any) {
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

async function refreshToken(req: any, res: any) {
  let refreshToken = req.body.refreshToken;
  const userData = verifyRefreshToken(refreshToken, res); //GET USER DATA FROM TOKEN

  const newAccessToken = await generateAccessToken(userData);
  const newRefreshToken = await generateRefreshToken(userData);

  return res
    .status(200)
    .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
}

async function getUserByToken(req: any, res: any) {
  //get user from req
  let user = req.user;

  return res.status(200).json({ user: user });
}
export { signup, login, updateProfile, refreshToken, getUserByToken };
