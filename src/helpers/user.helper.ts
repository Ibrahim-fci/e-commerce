import prisma from "../utils/prisma";
import { validationResult } from "express-validator";

const getUser = async (email: String, id: any) => {
  try {
    let user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (user) return user;

    return null;
  } catch {
    return null;
  }
};

export { getUser };
