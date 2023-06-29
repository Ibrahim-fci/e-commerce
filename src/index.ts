// @desc import third party packages
import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import * as dotenv from "dotenv";
import cron from "node-cron";
import cluster, { Cluster } from "cluster";
import os from "os";

// @desc import environment variables from .env file
dotenv.config();

// @desc import internal modules
import * as options from "./swagger.json";
import ApiError from "./utils/ApiError";
import globalError from "./middlewares/errors/globalError";

// @desc import routers
import userRouter from "./routes/user";
import categoryRouter from "./routes/category";
import productRouter from "./routes/product";
import orderRouter from "./routes/order";
import { describe } from "node:test";

// @desc create express server
const app = express();
let PORT = process.env.PORT || 8000;

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

app.use(morgan("tiny"));
app.use(express.json());
app.use(express.static("public"));

// @desc api routes
app.use("/users", userRouter);
app.use("/categories", categoryRouter);
app.use("/products", productRouter);
app.use("/orders", orderRouter);
app.use("/api", swaggerUi.serve, swaggerUi.setup(options, { explorer: true }));

app.all("*", async (req: any, res: any, next: any) => {
  const err = new Error(`cant find this route ${req.originalUrl}`);
  next(new ApiError(`cant find this route ${req.originalUrl}`, 400));
});

// @desc global error middeleware
app.use(globalError);

// @desc cron jop every 10 minute
cron.schedule("*/10 * * * *", () => {
  console.log("running a task every 10 minute");
});

// @desc add process equal to num of cpu cores to enhance the performance
// if (cluster.isPrimary) {
//   console.log("master_process_started  ", process.pid);
//   let NUM_CORES = os.cpus();
//   console.log(`#cpu cores: ${NUM_CORES.length}`);
//   for (let i = 0; i < NUM_CORES.length; i++) {
//     cluster.fork();
//   }
// } else {
//   console.log("worker_is_started");
//   app.listen(PORT, () => {
//     console.log(`server running on port ${PORT} ... , ${process.pid}`);
//   });
// }

app.listen(PORT, () => {
  console.log(`server running on port ${PORT} ...`);
});
