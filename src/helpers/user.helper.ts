import prisma from "../utils/prisma";
import { validationResult } from "express-validator";

const getUser = async (email: String, id: any) => {
  try {
    let user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        profile: true,
      },
    });

    if (user) return user;

    return null;
  } catch {
    return null;
  }
};

export { getUser };
