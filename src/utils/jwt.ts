import jwt from "jsonwebtoken";
require("dotenv").config();

const generateAccessToken = (param: any) => {
  //{ expiresIn: "1800s" }
  return jwt.sign(
    param,
    "postgresql://postgres:password@localhost:5432/mydb?schema=public"
  );
};

const verifyAccessToken = (token: any, res: any) => {
  try {
    return jwt.verify(
      token,
      "postgresql://postgres:password@localhost:5432/mydb?schema=public"
    );
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
};

export { generateAccessToken, verifyAccessToken };
