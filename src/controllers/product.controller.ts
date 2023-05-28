import prisma from "../utils/prisma";
import { validationResult } from "express-validator";
import { host } from "../utils/host";

async function addProduct(req: any, res: any) {
  //get user from request.user
  const user = req.user;
  console.log(req.body);
  console.log(req.file);

  if (user.role != "ADMIN" && user.role != "COMPANY")
    return res.status(400).json({ msg: "ليس لديك صلاحية لاضافة منتج" });

  /// validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  //create a new product
  try {
    const data = req.body;
    const subCategoryId = await prisma.subCategory.findUnique({
      where: {
        id: parseInt(data.subCategoryId),
      },
    });

    if (!subCategoryId)
      return res.status(404).json({ msg: "التصنيف غير موجود" });

    const product = await prisma.product.create({
      data: {
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        price: parseInt(data.price),
        quantity: parseInt(data.quantity) ? parseInt(data.quantity) : 10,
        url: req.file ? `${host}/images/products/` + req.file.filename : "",
        descriptionEn: data.descriptionEn ? data.descriptionEn : null,
        descriptionAr: data.descriptionAr ? data.descriptionAr : null,
        subCategoryId: subCategoryId.id,
        userId: user.id,
      },
    });
    return res
      .status(200)
      .json({ msg: "تم اضافة المنتج بنجاح", product: product });
  } catch {
    return res.status(400).json({ msg: "تأكد من صحة البيانات" });
  }
}

export { addProduct };
