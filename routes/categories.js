const express = require("express");
const router = express.Router();
const authProtect = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//GET all Categories
router.get("/", async (req, res, next) => {
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
    next(error);
  }
});

//GET one Category
router.get("/:id", async (req, res, next) => {
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
    next(error);
  }
});

//POST many categories
router.post("/many/", [authProtect, authAdmin], async (req, res, next) => {
  const { categoriesData } = req.body;
  try {
    const manycategories = await prisma.category.createMany({
      data: categoriesData.map((item) => ({
        title: item.title,
        description: item.description,
      })),
    });
    return res.json(manycategories);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
