import prisma from "../utils/prisma";
import { validationResult } from "express-validator";
import { host } from "../utils/host";

async function addProduct(req: any, res: any) {
  //get user from request.user
  const user = req.user;

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
      include: {
        sybCategory: true,
      },
    });
    return res
      .status(200)
      .json({ msg: "تم اضافة المنتج بنجاح", product: product });
  } catch {
    return res.status(400).json({ msg: "تأكد من صحة البيانات" });
  }
}

async function updateProduct(req: any, res: any) {
  //get user from request.user
  const user = req.user;

  if (user.role != "ADMIN" && user.role != "COMPANY")
    return res.status(400).json({ msg: "ليس لديك صلاحية لاضافة منتج" });

  /// validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  // try {
  let product = await prisma.product.findUnique({
    where: {
      id: parseInt(req.params.id),
    },
  });

  if (!product) return res.status(404).json({ msg: "المنتج غير موجود" });

  if (parseInt(req.body.subCategoryId) && req.body.subCategoryId) {
    let subCategory = await prisma.subCategory.findUnique({
      where: {
        id: parseInt(req.body.subCategoryId),
      },
    });

    if (!subCategory) return res.status(404).json({ msg: "التصنيف غير موجود" });
  }
  //TODO:remove Image after update it

  // update product data
  let updatedProduct = await prisma.product.update({
    where: {
      id: product.id,
    },
    data: {
      nameEn: req.body.nameEn ? req.body.nameEn : product.nameEn,
      nameAr: req.body.nameAr ? req.body.nameAr : product.nameAr,
      subCategoryId: parseInt(req.body.subCategoryId)
        ? parseInt(req.body.subCategoryId)
        : product.subCategoryId,
      price: parseInt(req.body.price)
        ? parseInt(req.body.price)
        : product.price,
      quantity: parseInt(req.body.quantity)
        ? parseInt(req.body.quantity)
        : product.quantity,
      descriptionAr: req.body.descriptionAr
        ? req.body.descriptionAr
        : product.descriptionAr,
      descriptionEn: req.body.descriptionEn
        ? req.body.descriptionEn
        : product.descriptionEn,
      url: req.file
        ? `${host}/images/products/` + req.file.filename
        : product.url,
    },
    include: {
      sybCategory: true,
    },
  });

  return res
    .status(200)
    .json({ msg: "تم التعديل بنجاح", product: updatedProduct });
  // } catch {}
}

async function deleteProduct(req: any, res: any) {
  //get user from request.user
  const user = req.user;

  //check if the user is the product creator or admin user
  try {
    let product = await prisma.product.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });

    if (!product)
      res.status(404).json({ msg: "product with this id not found" });

    if (product?.userId != user.id && user.role != "ADMIN")
      return res
        .status(400)
        .json({ msg: "you have no permission to delete this product" });
  } catch {
    return res.status(404).json({ msg: "product not found" });
  }

  try {
    await prisma.product.delete({
      where: {
        id: parseInt(req.params.id),
      },
    });

    return res.status(200).json({ msg: "تم الحذف بنجاح" });
  } catch {
    return res.status(400).json({ msg: "المنتج غير موجود" });
  }
}

async function allProduct(req: any, res: any) {
  let page = req.query.page;
  let size = req.query.size;

  try {
    let products = await prisma.product.findMany({
      skip: parseInt(page) ? parseInt(page) : 0,
      take: parseInt(size) ? parseInt(size) : 10,
      include: {
        sybCategory: true,
      },
    });

    return res.status(200).json({ products });
  } catch {
    return res.status(500).json({ msg: "somthing went wrong" });
  }
}
export { addProduct, updateProduct, deleteProduct, allProduct };
