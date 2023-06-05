//import third party packages
import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import * as dotenv from "dotenv";
import cron from "node-cron";
dotenv.config();

// import internal modules
import * as options from "./swagger.json";

// import routers
import userRouter from "./routes/user";
import categoryRouter from "./routes/category";
import productRouter from "./routes/product";
import orderRouter from "./routes/order";

const app = express();
let PORT = process.env.PORT || 8000;

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

app.use(morgan("tiny"));
app.use(express.json());
app.use(express.static("public"));

app.use("/users", userRouter);
app.use("/categories", categoryRouter);
app.use("/products", productRouter);
app.use("/orders", orderRouter);
app.use("/", swaggerUi.serve, swaggerUi.setup(options, { explorer: true }));
// app.use("*", async (req: any, res: any) => res.json({ msg: "ffffffffff" }));

cron.schedule("*/15 * * * * *", function () {
  console.log("---------------------");
  console.log("running a task every 15 seconds");
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT} ...`);
});
