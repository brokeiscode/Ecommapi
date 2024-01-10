const express = require("express");
const cors = require("cors");
const products = require("./routes/products");
const categories = require("./routes/categories");
const brands = require("./routes/brands");
const users = require("./routes/users");
const auth = require("./routes/auth");
const cart = require("./routes/cart");
const config = require("config");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/products", products);
app.use("/categories", categories);
app.use("/brands", brands);
app.use("/users", users);
app.use("/auth", auth);
app.use("/cart", cart);

console.log("Direct NODE_ENV", process.env.NODE_ENV);
console.log("app.get", app.get("env"));
console.log("App Secret", config.get("Appname"));
// console.log("App Secret", config.get("jwtSecret"));

const port = process.env.PORT || 5001;
app.listen(port, () =>
  console.log("> Server is up and running on port : " + port)
);
