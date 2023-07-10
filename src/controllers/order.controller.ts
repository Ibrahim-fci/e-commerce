import { Cart, CartItem, Prisma, Role } from "@prisma/client";
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
    include: { cartItems: { where: { sold: false } } },
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

const createOrder = expressAsyncHandelar(async (req: any, res: any) => {
  // @desc getUserFrom Token
  const user = req.user;
  const cartItemsIdes = req.body.cartItemsIdes;
  let selectedItemsPrice = 0;

  // @desc get body data
  const deliveryAddress = req.body.deliveryAddress;

  // @desc get userCart
  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: { cartItems: { where: { sold: false } } },
  });

  // @desc get cartItems
  const cartItems = await prisma.cartItem.findMany({
    where: {
      id: {
        in: cartItemsIdes,
      },
      sold: false,
    },
  });

  if (!cart) return res.status(400).json({ msg: "cart is empty" });
  if (cartItems.length == 0)
    return res
      .status(200)
      .json({ msg: "item eithier sold or not added to your cart" });

  // @desc create an order
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      cartId: cartItems[0].cartId,
      deliveryAddress: deliveryAddress,
      totalOrderPrice: 0,
    },
    include: {
      user: {
        select: {
          email: true,
          fullName: true,
          profile: {
            select: {
              fName: true,
              lName: true,
              address: true,
              city: true,
              country: true,
            },
          },
        },
      },
      cart: {
        include: {
          cartItems: {
            where: { sold: false },
          },
        },
      },
    },
  });

  // @desc decrement products quantity
  // @dec update product sold num

  cartItems.map(async (cartItem) => {
    selectedItemsPrice = cartItem.price || 0;

    let product = await prisma.product.findUnique({
      where: {
        id: cartItem.productId,
      },
    });

    if (!product) return;

    await prisma.product.update({
      where: { id: cartItem.productId },
      data: {
        sold: product?.sold + cartItem.quantity,
        quantity: product.quantity
          ? product.quantity - cartItem.quantity
          : product.quantity,
      },
    });

    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { sold: true, orderId: order.id },
    });

    let total = cart.totalCartPrice
      ? cart.totalCartPrice - selectedItemsPrice
      : cart.totalCartPrice;
    if (total && total < 0) total = 0;

    await prisma.cart.update({
      where: { userId: user.id },
      data: {
        totalCartPrice: total,
      },
    });
  });

  // @desc update cart total price

  // @desc update order total_price
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      totalOrderPrice: selectedItemsPrice,
    },
  });

  const cartLength = await cartNum(user.id);

  return res.status(200).json({
    msg: "order created successfully",
    order: updatedOrder,
    cartLength: cartLength - cartItems.length,
  });
});

async function bestSellers(req: any, res: any) {
  // get best sold products
  let productsList = await getproducts(req);

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
    productsList: productsList,
    categories: categories,
  });
}

const getCartItems = expressAsyncHandelar(async (req: any, res: any) => {
  // @desc getUserFrom Token
  const user = req.user;

  // @desc get userCart
  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      cartItems: {
        where: { sold: false },
        include: { product: { include: { sybCategory: true, flavour: true } } },
      },
    },
  });

  if (!cart) return res.status(400).json({ msg: "cart is empty" });
  return res.status(200).json({ cart: cart });
});

const cartItemsNum = expressAsyncHandelar(async (req: any, res: any) => {
  // @desc getUserFrom Token
  const user = req.user;

  // @desc get userCart
  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: { cartItems: { where: { sold: false } } },
  });
  // return 200 with cartLength:0      alaa commmit 🫡
  if (!cart) return res.status(200).json({ cartLength: 0 });

  return res.status(200).json({ cartLength: cart.cartItems.length });
});

const productOrders = expressAsyncHandelar(async (req: any, res: any) => {
  // @desc getUserFrom Token
  const user = req.user;
  const productId = parseInt(req.params.id);
  const temp = [];

  if (user.role != Role.COMPANY && user.role != Role.ADMIN)
    return res
      .status(400)
      .json({ msg: "you have no permission to get orders" });

  // @desc find product
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  // @desc check if product existred  and user have permissions to see it
  if (!product) return res.status(400).json({ msg: "product not found" });
  if (product.userId != user.id)
    return res.status(400).json({
      msg: `you have no permission to get orders of product with id ${productId}`,
    });

  const cartItems = await prisma.cartItem.findMany({
    where: {
      productId: productId,
      sold: true,
    },
    include: { product: true },
  });

  for (let i = 0; i < cartItems.length; i++) {
    let orderId = cartItems[i].orderId || 0;
    let order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!order) continue;
    let customObj = {
      // product: cartItems[i].product,
      price: cartItems[i].price,
      quantity: cartItems[i].quantity,
      order: order,
    };

    temp.push(customObj);
  }

  return res.status(200).json({ data: temp });
});

export {
  addToCart,
  updateCartItem,
  deleteCartItem,
  createOrder,
  getCartItems,
  bestSellers,
  cartItemsNum,
  productOrders,
};

// @desc Helpper func......
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
  let page = req.query.page;
  let size = req.query.size;

  let products = await prisma.product.findMany({
    orderBy: {
      sold: "desc",
    },
    include: { sybCategory: true, flavour: true },

    skip: parseInt(page) ? (parseInt(page) - 1) * size : 0,
    take: parseInt(size) ? parseInt(size) : 10,
  });

  return products;
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

const cartNum = async (cartId: number) => {
  // @desc get userCart
  const cartItemsNum = await prisma.cartItem.count({
    where: {
      cartId: cartId,
      sold: false,
    },
  });

  return cartItemsNum;
};

const getOrder = async (orderId: number) => {
  // @desc create an order
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      user: {
        select: {
          email: true,
          fullName: true,
          profile: {
            select: {
              fName: true,
              lName: true,
              address: true,
              city: true,
              country: true,
            },
          },
        },
      },
      cart: {
        include: {
          cartItems: {
            where: { sold: false },
          },
        },
      },
    },
  });

  return order;
};
