const express = require("express");
const cors = require("cors");
const error = require("./middleware/error");
const products = require("./routes/products");
const categories = require("./routes/categories");
const brands = require("./routes/brands");
const users = require("./routes/users");
const auth = require("./routes/auth");
const cart = require("./routes/cart");
const checkout = require("./routes/checkout");
const order = require("./routes/orders");
const otp = require("./routes/otp");
const config = require("config");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/static", express.static("public"));

app.use("/products", products);
app.use("/categories", categories);
app.use("/brands", brands);
app.use("/users", users);
app.use("/auth", auth);
app.use("/cart", cart);
app.use("/checkout", checkout);
app.use("/order", order);
app.use("/otp", otp);

app.use(error);

console.log("Direct NODE_ENV", process.env.NODE_ENV);
console.log("app.get", app.get("env"));
console.log("App Secret", config.get("Appname"));

const port = config.get("PORT");
app.listen(port, () =>
  console.log("> Server is up and running on port : " + port)
);
