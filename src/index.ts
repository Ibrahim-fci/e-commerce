//import third party packages
import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import * as dotenv from "dotenv";
dotenv.config();

// import internal modules
import * as options from "./swagger.json";

// import routers
import userRouter from "./routes/user";
import categoryRouter from "./routes/category";

const app = express();
let PORT = process.env.PORT || 8000;

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

app.use(morgan("tiny"));
app.use(express.json());
app.use(express.static("public"));

app.use("/users", userRouter);
app.use("/category", categoryRouter);
app.use("/", swaggerUi.serve, swaggerUi.setup(options, { explorer: true }));

app.listen(PORT, () => {
  console.log(`server running on port ${PORT} ...`);
});
