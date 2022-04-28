require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const logger = require("morgan");

// Extra security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

// connectDB
const connectDB = require("./db/connect");
const authenticateUser = require("./middleware/authentication");
// routes
const authRouter = require("./routes/auth");
const jobsRouter = require("./routes/jobs");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.set("trust proxy", 1);
app.get("/api/v1/ip", (req, res) => res.send(request.ip));
app.use(
  rateLimiter({
    windowMs: 15 * 1000 * 60,
    max: 100,
  })
);
app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(xss());
// extra packages
app.use(logger("dev"));
// routes
app.use("/api/v1/auth", authRouter);
app.use(
  "/api/v1/jobs",
  authenticateUser,
  jobsRouter
); /**All the routes are protected instead of doing this for individual ones */

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
