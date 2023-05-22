import { verifyAccessToken } from "../../utils/jwt";
import { getUser } from "../../helpers/user.helper";

const authorize = async (req: any, res: any, next: any) => {
  //CHECK IF THERE IS TOKEN IN THE HEADER
  if (!req.headers.authorization) {
    return res.status(403).json({ error: "No credentials sent!" });
  }

  const token = req.headers.authorization.split(" ")[1]; //GET TOKEN FROM REQUEST HEADER
  const userData = verifyAccessToken(token, res); //GET USER DATA FROM TOKEN

  //CHECK IF USER  EXISTED
  const user = await getUser(userData.email, userData.id);
  if (!user) return res.status(400).json({ msg: "user  not existed" });

  //RETURN USER DATA IN REQUEST.USER
  req.user = user;

  next();
};

export { authorize };
