const express = require("express");
const apiRouter = require("./routers/api-router")
const cors = require("cors");
const { handleCustomErrors, handlePsqlErrors, handleServerErrors } = require("./controllers/errors.controller");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", apiRouter);
app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);

module.exports = app;
