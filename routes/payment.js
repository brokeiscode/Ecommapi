const express = require("express");
const router = express.Router();
const authProtect = require("../middleware/auth");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  PrismaClientValidationError,
  PrismaClientUnknownRequestError,
} = require("@prisma/client/runtime/library");

module.exports = router;
