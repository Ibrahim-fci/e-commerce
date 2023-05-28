import jwt from "jsonwebtoken";
require("dotenv").config();

const generateAccessToken = (param: any) => {
  //{ expiresIn: "1800s" }
  return jwt.sign(param, 'process.env["TOKEN_SECRET"]');
};

const verifyAccessToken = (token: any, res: any) => {
  try {
    return jwt.verify(token, 'process.env["TOKEN_SECRET"]');
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
};

const generateRefreshToken = (param: any) => {
  //{ expiresIn: "1800s" }
  return jwt.sign(param, 'process.env["REFRESH_TOKEN_SECRET"]');
};

const verifyRefreshToken = (token: any, res: any) => {
  try {
    return jwt.verify(token, 'process.env["REFRESH_TOKEN_SECRET"]');
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
};

export {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};
