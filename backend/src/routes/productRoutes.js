const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const upload = require("../middleware/upload");
const { upsertProductSchema } = require("../validators/productValidators");
const productController = require("../controllers/productController");

const router = express.Router();

router.get("/", productController.listProducts);
router.get("/:slug", productController.getProductBySlug);
router.post("/", protect, authorize("ADMIN"), upload.single("image"), validate(upsertProductSchema), productController.createProduct);
router.patch(
  "/:productId",
  protect,
  authorize("ADMIN"),
  upload.single("image"),
  validate(upsertProductSchema),
  productController.updateProduct
);
router.delete("/:productId", protect, authorize("ADMIN"), productController.deleteProduct);

module.exports = router;
