import prisma from "../utils/prisma";
import { host } from "../utils/host";
import expressAsyncHandelar from "express-async-handler";
import slugify from "slugify";

const addProduct = expressAsyncHandelar(async function (req: any, res: any) {
  //get user from request.user
  const user = req.user;

  if (user.role != "ADMIN" && user.role != "COMPANY")
    return res.status(400).json({ msg: "ليس لديك صلاحية لاضافة منتج" });

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

    const flavour = await prisma.flavour.findUnique({
      where: {
        id: parseInt(data.flavourId),
      },
    });

    if (!flavour) return res.status(404).json({ msg: "التصنيف غير موجود" });

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
        flavourId: flavour.id,
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
});

const updateProduct = expressAsyncHandelar(async function (req: any, res: any) {
  //get user from request.user
  const user = req.user;

  if (user.role != "ADMIN" && user.role != "COMPANY")
    return res.status(400).json({ msg: "ليس لديك صلاحية لاضافة منتج" });

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
      flavourId: parseInt(req.body.flavourId)
        ? parseInt(req.body.flavourId)
        : product.flavourId,

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
});

const deleteProduct = expressAsyncHandelar(async function (req: any, res: any) {
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
});

async function allProduct(req: any, res: any) {
  let page = req.query.page;
  let size = req.query.size;

  try {
    let products = await prisma.product.findMany({
      skip: parseInt(page) ? (parseInt(page) - 1) * size : 0,
      take: parseInt(size) ? parseInt(size) : 10,
      include: {
        sybCategory: true,
        flavour: true,
      },
    });

    return res.status(200).json({ products });
  } catch {
    return res.status(500).json({ msg: "somthing went wrong" });
  }
}

const productFilter = expressAsyncHandelar(async function (req: any, res: any) {
  let { nameEn, nameAr, page, size, priceStart, priceEnd, category } =
    req.query;
  console.log(typeof String(nameEn).trim(), ";;;;;;");
  let subCategoriesIdes: [] = req.body.subCategoriesIdes;
  let flavourIdes: [] = req.body.flavourIdes;

  // if there is no filters return all products
  if (
    (!nameEn || nameEn === "") &&
    (!nameAr || nameAr == "") &&
    !subCategoriesIdes &&
    !flavourIdes &&
    (!priceStart || priceStart == "") &&
    (!priceEnd || priceEnd == "") &&
    (!category || category == "")
  ) {
    const productsNum = await prisma.product.count();
    const products = await prisma.product.findMany({
      skip: parseInt(page) ? (parseInt(page) - 1) * size : 0,
      take: parseInt(size) ? parseInt(size) : 10,
      include: {
        sybCategory: true,
        flavour: true,
      },
    });

    return res.status(200).json({ filtered_products: products, productsNum });
  }

  if (nameAr == "") nameAr = null;
  if (nameEn == "") nameEn = null;

  // get all subCategories from categoryID
  const subCategoriesFromCategories = await getSubCatgoryListFromCategory(
    parseInt(category)
  );

  if ((priceStart && priceStart != "") || (priceEnd && priceEnd != "")) {
    const filtered_products = await priceFilter(
      subCategoriesIdes,
      subCategoriesFromCategories,
      flavourIdes,
      nameEn,
      page,
      size,
      nameAr,
      priceStart,
      priceEnd
    );

    return res.status(200).json({
      filtered_products: filtered_products.filtered_product,
      productsNum: filtered_products.filtered_product_count,
    });
  }
  //if there is a filters
  const filtered_product = await prisma.product.findMany({
    where: {
      OR: [
        {
          subCategoryId: {
            in: subCategoriesIdes ? subCategoriesIdes : [],
          },
        },
        {
          subCategoryId: {
            in: subCategoriesFromCategories ? subCategoriesFromCategories : [],
          },
        },

        {
          flavourId: {
            in: flavourIdes ? flavourIdes : [],
          },
        },
        {
          nameEn: {
            contains: nameEn,
            mode: "insensitive",
          },
        },

        {
          nameAr: {
            contains: nameAr,
            mode: "insensitive",
          },
        },
      ],
    },

    include: {
      sybCategory: true,
      flavour: true,
    },

    skip: parseInt(page) ? (parseInt(page) - 1) * size : 0,
    take: parseInt(size) ? parseInt(size) : 10,
  });

  //filters_nums
  const filtered_product_num = await prisma.product.count({
    where: {
      OR: [
        {
          subCategoryId: {
            in: subCategoriesIdes ? subCategoriesIdes : [],
          },
        },
        {
          subCategoryId: {
            in: subCategoriesFromCategories ? subCategoriesFromCategories : [],
          },
        },

        {
          flavourId: {
            in: flavourIdes ? flavourIdes : [],
          },
        },
        {
          nameEn: {
            contains: nameEn,
            mode: "insensitive",
          },
        },

        {
          nameAr: {
            contains: nameAr,
            mode: "insensitive",
          },
        },
      ],
    },
  });

  return res
    .status(200)
    .json({ filtered_product, productsNum: filtered_product_num });
});

const getProductById = expressAsyncHandelar(async function (
  req: any,
  res: any
) {
  const { page, size } = req.query;

  const product = await prisma.product.findUnique({
    where: {
      id: parseInt(req.params.id),
    },
    include: {
      sybCategory: {
        include: {
          category: true,
        },
      },
      flavour: true,
    },
  });

  if (!product)
    return res
      .status(400)
      .json({ msg: `product with id: ${req.params.id}  Not found` });

  //if there is a filters
  let filtered_products = await prisma.product.findMany({
    where: {
      id: {
        not: product.id,
      },
      OR: [
        {
          subCategoryId: product.subCategoryId,
        },
        {
          flavourId: product.flavourId,
        },
      ],
    },
    include: {
      sybCategory: {
        include: {
          category: true,
        },
      },
      flavour: true,
    },

    skip: parseInt(page) ? (parseInt(page) - 1) * size : 0,
    take: parseInt(size) ? parseInt(size) : 10,
  });

  return res.status(200).json({ product, relatedProducts: filtered_products });
});

const priceFilter = async function (
  subCategoriesIdes: any,
  subCategoriesFromCategories: any,
  flavourIdes: any,
  nameEn: any,
  page: any,
  size: any,
  nameAr: any,
  priceStart: any,
  priceEnd: any
) {
  //if there is a filters
  const filtered_product = await prisma.product.findMany({
    where: {
      OR: [
        {
          subCategoryId: {
            in: subCategoriesIdes ? subCategoriesIdes : [],
          },
        },
        {
          subCategoryId: {
            in: subCategoriesFromCategories ? subCategoriesFromCategories : [],
          },
        },

        {
          flavourId: {
            in: flavourIdes ? flavourIdes : [],
          },
        },
        {
          nameEn: {
            contains: nameEn,
            mode: "insensitive",
          },
        },
        {
          price: {
            gte: priceStart ? parseInt(priceStart) : 0,
            lte: priceEnd ? parseInt(priceEnd) : 1000000,
          },
        },

        {
          nameAr: {
            contains: nameAr,
            mode: "insensitive",
          },
        },
      ],
    },
    include: {
      sybCategory: true,
      flavour: true,
    },

    skip: parseInt(page) ? (parseInt(page) - 1) * size : 0,
    take: parseInt(size) ? parseInt(size) : 10,
  });

  const filtered_product_count = await prisma.product.count({
    where: {
      OR: [
        {
          subCategoryId: {
            in: subCategoriesIdes ? subCategoriesIdes : [],
          },
        },
        {
          subCategoryId: {
            in: subCategoriesFromCategories ? subCategoriesFromCategories : [],
          },
        },

        {
          flavourId: {
            in: flavourIdes ? flavourIdes : [],
          },
        },
        {
          nameEn: {
            contains: nameEn,
            mode: "insensitive",
          },
        },
        {
          price: {
            gte: priceStart ? parseInt(priceStart) : 0,
            lte: priceEnd ? parseInt(priceEnd) : 1000000,
          },
        },

        {
          nameAr: {
            contains: nameAr,
            mode: "insensitive",
          },
        },
      ],
    },
  });

  return {
    filtered_product,
    filtered_product_count,
  };
};
export {
  addProduct,
  updateProduct,
  deleteProduct,
  allProduct,
  productFilter,
  getProductById,
};

/// helper fuc
const getSubCatgoryListFromCategory = async (categoryId: any) => {
  try {
    let temp: number[] = [];
    let subCategories = await prisma.category.findUnique({
      where: {
        id: parseInt(categoryId),
      },
      select: {
        subCategories: true,
      },
    });

    if (subCategories && subCategories.subCategories) {
      temp = subCategories.subCategories.map((elem) => {
        return elem.id;
      });
    }
    return temp ? temp : [];
  } catch {
    return [];
  }
};
