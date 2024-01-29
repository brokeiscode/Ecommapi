const express = require("express");
const router = express.Router();
const { format } = require("util");
const { Storage } = require("@google-cloud/storage");
const multer = require("multer");
const authProtect = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//configuration of multer settings
const maxSize = 2 * 1024 * 1024;
const multerStorage = multer.memoryStorage({
  // Define filename function to change filename
  filename: function (req, file, callback) {
    // Modify filename as per your requirement
    callback(null, Date.now() + "-" + file.originalname);
  },
});
const processFile = multer({
  storage: multerStorage,
  limits: { fileSize: maxSize },
}).single("image");

//Google Cloud Storage configuration
const storageClient = new Storage({
  projectId: "ecommerce-server-410119",
  keyFilename: "ecommerce-server-service-key.json",
});
const bucket = storageClient.bucket("cloudsavedfile.uptuned.shop");

// //Setting up Multer - Multer storage configuration
// const storageforproduct = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/productpicture"); //Destination folder for uploaded files
//   },
//   filename: function (req, file, cb) {
//     //use a unique filename for the uploaded file
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const uploadforproduct = multer({ storage: storageforproduct });

//post an product picture

router.post(
  "/upload-productpicture/:id",
  [authProtect],
  processFile,
  async (req, res, next) => {
    try {
      const theid = parseInt(req.params.id);
      const file = req.file;
      //   console.log("please na", file);
      if (!file) {
        return res.status(400).send({ message: "Please upload a file!" });
      }

      // Create a new blob in the bucket and upload the file data.
      const blob = bucket.file(
        file.originalname.replace(
          file.originalname,
          Date.now() + "-" + file.originalname
        )
      );
      const blobStream = blob.createWriteStream({
        resumable: false,
      });

      //new Promise to await the url format to be used to set data in product
      const imageUrl = await new Promise((resolve, reject) => {
        blobStream.on("error", (err) => {
          //   res.status(500).send({
          //     msg: "Error uploading file.",
          //   });
          reject("Error uploading file.");
        });

        blobStream.on("finish", () => {
          //Create URL for directly file access via HTTP.
          const publicUrl = format(
            `https://storage.googleapis.com/${bucket.name}/${blob.name}`
          );
          //   res.status(200).send({
          //     msg: "File uploaded successfully.",
          //     url: publicUrl,
          //   });
          resolve(publicUrl);
        });

        blobStream.end(file.buffer);
      });
      //find the product and add image url to the database
      const aproduct = await prisma.product.update({
        where: {
          id: theid,
        },
        data: {
          image: imageUrl,
        },
      });
      return res.send({
        msg: "Product picture uploaded sucessfully",
        url: aproduct.image,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
