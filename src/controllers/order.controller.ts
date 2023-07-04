import { Cart, CartItem, Prisma } from "@prisma/client";
import prisma from "../utils/prisma";
import expressAsyncHandelar from "express-async-handler";

const addToCart = expressAsyncHandelar(async (req: any, res: any) => {
  // @desc getUserFrom Token
  const user = req.user;

  // @desc getProduct by id
  const productId = parseInt(req.body.productId);
  const quantity = parseInt(req.body.quantity);

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product)
    return res.json({ msg: `product with id ${productId} not found...` });

  // get userCart if exist or create a new cart
  let userCart = await prisma.cart.findFirst({
    where: {
      userId: user.id,
    },
    include: { cartItems: true },
  });

  if (!userCart) {
    userCart = await prisma.cart.create({
      data: {
        userId: user.id,
      },
      include: { cartItems: true },
    });
  }

  // create a new cartItem
  const cartItem = await prisma.cartItem.create({
    data: {
      cartId: userCart.id,
      productId: product.id,
      quantity: quantity,
      price: quantity * product.price,
    },
  });

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

// async function makeOrder(req: any, res: any) {
//   const user = req.user;

//   try {
//     let product = await prisma.product.findUnique({
//       where: {
//         id: parseInt(req.body.productId),
//       },
//     });

//     if (!product) return res.status(404).json({ msg: "product not found!" });

//     //TODO: Check if There is Enough num of product quntity

//     //create the order

//     const order = await prisma.order.create({
//       data: {
//         productId: product.id,
//         quantity: parseInt(req.body.quantity),
//       },
//     });

//     //add order to user cart
//     let total = product.price * order.quantity;

//     const addToCart = await prisma.cart.create({
//       data: {
//         orderId: order.id,
//         userId: user.id,
//         price: total,
//       },
//     });

//     // get num_of_user_orders
//     let userOrdersCount = await prisma.cart.aggregate({
//       _count: {
//         orderId: true,
//       },
//       where: {
//         userId: user.id,
//         status: "INPROGRESS",
//       },
//       orderBy: {
//         price: "desc",
//       },
//     });

//     return res.status(200).json({
//       msg: "order added to your cart successfully",
//       unConfirmedOrders: userOrdersCount._count.orderId,
//     });
//   } catch {
//     return res.status(400).json({ msg: "somthing went wrong!!!" });
//   }
// }

// async function updateOrder(req: any, res: any) {
//   const user = req.user;

//   try {
//     const order = await prisma.cart.findUnique({
//       where: {
//         id: parseInt(req.params.id),
//       },
//     });

//     if (!order)
//       return res.status(404).json({ msg: "order not found in your cart" });
//     if (order.userId != user.id && user.role != "Admin")
//       return res
//         .status(400)
//         .json({ msg: "you have no permission to update order" });

//     //update order quantity
//     const updatedOrder = await prisma.order.update({
//       where: {
//         id: order.orderId,
//       },
//       data: {
//         quantity: parseInt(req.body.quantity),
//       },
//       include: {
//         product: true,
//       },
//     });

//     //TODO: Check if There is Enough num of product quntity

//     let total = updatedOrder.product.price * updatedOrder.quantity;
//     const updatedCart = await prisma.cart.update({
//       where: {
//         id: parseInt(req.params.id),
//       },
//       data: {
//         price: total,
//       },
//       select: {
//         id: true,
//         order: {
//           select: {
//             product: {
//               select: {
//                 nameEn: true,
//                 price: true,
//                 descriptionEn: true,
//                 url: true,
//               },
//             },
//             quantity: true,
//           },
//         },
//         createdAt: true,
//         status: true,
//         price: true,
//       },
//     });

//     return res
//       .status(200)
//       .json({ msg: "order updated successfully", order: updatedCart });
//   } catch {
//     return res.status(500).json({ msg: "somthing went wrong" });
//   }
// }

// async function deleteOrder(req: any, res: any) {
//   const user = req.user;

//   try {
//     const order = await prisma.cart.findUnique({
//       where: {
//         id: parseInt(req.params.id),
//       },
//     });

//     if (!order)
//       return res.status(404).json({ msg: "order not found in your cart" });

//     if (order.userId != user.id && user.role != "Admin")
//       return res
//         .status(400)
//         .json({ msg: "you have no permission to delete order" });

//     let orderId = order.orderId;

//     // firest remove order from user cart
//     await prisma.cart.delete({
//       where: {
//         id: parseInt(req.params.id),
//       },
//     });

//     // then delete order
//     await prisma.order.delete({
//       where: {
//         id: orderId,
//       },
//     });

//     // TODO: Add Prouduct Quantity
//     return res
//       .status(200)
//       .json({ msg: "order removed from the cart successfully" });
//   } catch {
//     return res.status(500).json({ msg: "somthing went wrong" });
//   }
// }

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

export { addToCart, bestSellers };

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

// async function getproducts(req: any) {
//   let productsList: any[] = [];
//   let page = req.query.page;
//   let size = req.query.size;

//   let orders = await prisma.order.groupBy({
//     by: ["productId", "createdAt"],

//     _sum: {
//       quantity: true,
//     },
//     orderBy: {
//       _sum: {
//         quantity: "desc",
//       },
//     },
//     skip: parseInt(page) ? (parseInt(page) - 1) * size : 0,
//     take: parseInt(size) ? parseInt(size) : 10,
//   });

//   //get product data
//   for (let i = 0; i < orders.length; i++) {
//     let product = await prisma.product.findUnique({
//       where: {
//         id: orders[i].productId,
//       },
//       include: {
//         sybCategory: true,
//       },
//     });

//     productsList.push({
//       product: product,
//       num_orders: orders[i]._sum.quantity,
//     });
//   }

//   return productsList;
// }

const getCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: {
      id: "asc",
    },
  });

  return categories;
};
