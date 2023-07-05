import { Cart, CartItem, Prisma } from "@prisma/client";
import prisma from "../utils/prisma";
import expressAsyncHandelar from "express-async-handler";

const addToCart = expressAsyncHandelar(async (req: any, res: any) => {
  // @desc getUserFrom Token
  const user = req.user;
  let { productId, quantity } = req.body;
  quantity = parseInt(quantity);

  // @desc getProduct by id
  const product = await prisma.product.findUnique({
    where: {
      id: parseInt(productId),
    },
  });

  if (!product)
    return res.json({ msg: `product with id ${productId} not found...` });

  // get userCart if exist or create a new cart
  let userCart = await getCart(user.id);

  // create a new cartItem
  const cartItem = await prisma.cartItem.create({
    data: {
      cartId: userCart.id,
      productId: product.id,
      quantity: quantity,
      price: quantity * product.price,
    },
  });

  // @desc get totalCartPrice and add a new cartItem price
  let totalCartPrice = userCart.totalCartPrice
    ? userCart.totalCartPrice + quantity * product.price
    : cartItem.price;

  const cart = await prisma.cart.update({
    where: { userId: user.id },
    data: {
      totalCartPrice: totalCartPrice,
    },
    include: { cartItems: true },
  });

  return res.json({
    msg: "product added to cart successfully",
    cartLength: cart?.cartItems.length || 0,
  });
});

const updateCartItem = expressAsyncHandelar(async (req: any, res: any) => {
  // @desc getUserFrom Token
  const user = req.user;
  const cartItemId = parseInt(req.params.id);
  const quantity = parseInt(req.body.quantity);

  const cartItem = await prisma.cartItem.findUnique({
    where: {
      id: cartItemId,
    },
    include: { product: true },
  });

  if (!cartItem)
    return res
      .status(400)
      .json({ msg: `cartItem with id ${cartItemId} not found...` });

  if (quantity <= 0)
    return res.status(400).json({ msg: "quantity must be gt 0" });

  if (quantity == cartItem.quantity)
    return res.status(400).json({ msg: "there is no changes to applay..." });

  let oldPrice = cartItem.price ? cartItem.price : 0;
  let newPrice = cartItem.product.price * quantity;

  // @desc uppdate quantity and price in cartItem
  await prisma.cartItem.update({
    where: {
      id: cartItemId,
    },
    data: { price: newPrice, quantity: quantity },
  });

  const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  const totalCartPrice = cart?.totalCartPrice
    ? cart.totalCartPrice - oldPrice + newPrice
    : newPrice;

  const uppdatedCart = await prisma.cart.update({
    where: { userId: user.id },
    data: {
      totalCartPrice: totalCartPrice,
    },
  });

  return res.status(200).json({ msg: "cartItem uppdated successfully..." });
});

const deleteCartItem = expressAsyncHandelar(async (req: any, res: any) => {
  // @desc getUserFrom Token
  const user = req.user;
  const cartItemId = parseInt(req.params.id);

  //@desc get cartItem
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });

  if (!cartItem)
    return res
      .status(400)
      .json({ msg: `cartItem with id ${cartItemId} not found...` });
  if (cartItem.cart.userId != user.id)
    return res
      .status(400)
      .json({ msg: "you have no permission to delete this cartItem" });

  const cart = await prisma.cart.findUnique({
    where: {
      userId: user.id,
    },
  });

  // @desc substract cartItemPrice from totalCartPrice
  let oldPrice = cartItem.price ? cartItem.price : 0;
  const totalCartPrice = cart?.totalCartPrice
    ? cart.totalCartPrice - oldPrice
    : 0;

  const upddatedCart = await prisma.cart.update({
    where: {
      userId: user.id,
    },
    data: {
      totalCartPrice: totalCartPrice,
    },
  });

  // @desc delete cartItem
  await prisma.cartItem.delete({ where: { id: cartItemId } });

  return res.status(200).json({ msg: "cartItem deleted successfully" });
});

async function bestSellers(req: any, res: any) {
  // get best sold products
  // let productsList = await getproducts(req);

  // get num of users
  let usersNum = await userRoleHandeler();

  //get num of products
  let numProducts = await prisma.product.count();

  // get num of orders
  let numOrders = await prisma.order.count();

  //get all categories
  const categories = await getCategories();

  return res.status(200).json({
    msg: "home data retrived successfully",
    users: usersNum,
    numProducts: numProducts,
    numOrders: numOrders,
    // productsList: productsList,
    categories: categories,
  });
}

export { addToCart, updateCartItem, deleteCartItem, bestSellers };

async function userRoleHandeler() {
  let usersNum: any[] = [];

  let users = await prisma.user.groupBy({
    by: ["role"],
    _count: {
      role: true,
    },
  });

  for (let i = 0; i < users.length; i++) {
    usersNum.push({ role: users[i].role, num: users[i]._count.role });
  }

  return usersNum;
}

async function getproducts(req: any) {
  let productsList: any[] = [];
  let page = req.query.page;
  let size = req.query.size;

  let orders = await prisma.cartItem.groupBy({
    by: ["productId", "createdAt"],

    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    skip: parseInt(page) ? (parseInt(page) - 1) * size : 0,
    take: parseInt(size) ? parseInt(size) : 10,
  });

  //get product data
  for (let i = 0; i < orders.length; i++) {
    let product = await prisma.product.findUnique({
      where: {
        id: orders[i].productId,
      },
      include: {
        sybCategory: true,
      },
    });

    productsList.push({
      product: product,
      num_orders: orders[i]._sum.quantity,
    });
  }

  return productsList;
}

const getCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: {
      id: "asc",
    },
  });

  return categories;
};

const getCart = async (userId: number) => {
  // get userCart if exist or create a new cart
  let userCart = await prisma.cart.findFirst({
    where: {
      userId: userId,
    },
    include: { cartItems: true },
  });

  if (!userCart) {
    userCart = await prisma.cart.create({
      data: {
        userId: userId,
      },
      include: { cartItems: true },
    });
  }

  return userCart;
};
