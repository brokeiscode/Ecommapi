const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//GET all Categories
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: true,
      },
    });
    if (!categories) {
      return res.status(404).json({
        msg: "No data found. Something is wrong",
      });
    }
    res.json(categories);
  } catch (error) {
    res.status(400).send("An error occured");
  }
});

//GET one Category
router.get("/:id", async (req, res) => {
  const theid = parseInt(req.params.id);
  try {
    const acategories = await prisma.category.findUnique({
      where: {
        id: theid,
      },
      include: {
        products: true,
      },
    });
    if (!acategories) {
      return res.status(404).json({
        msg: "No data found. Something is wrong",
      });
    }
    return res.json(acategories);
  } catch (error) {
    return res.status(400).json({
      msg: "Something went wrong",
      error,
    });
  }
});

//POST a category

module.exports = router;
