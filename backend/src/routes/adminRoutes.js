const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const adminController = require("../controllers/adminController");
const adminHawanController = require("../controllers/adminHawanController");
const validate = require("../middleware/validate");
const upload = require("../middleware/upload");
const { adminCreateSchema, adminUpdateSchema, idParamSchema, verificationSchema } = require("../validators/hawanValidators");

const router = express.Router();

router.use(protect, authorize("ADMIN"));

router.get("/dashboard", adminController.getDashboardStats);
router.get("/users", adminController.listUsers);
router.post("/users", adminController.createUser);
router.patch("/users/:userId", adminController.updateUser);
router.delete("/users/:userId", adminController.deleteUser);
router.get("/products", adminController.listProductsAdmin);
router.post("/products", adminController.createProductAdmin);
router.patch("/products/:productId", adminController.updateProductAdmin);
router.post("/products/:productId/image", upload.single("image"), adminController.uploadProductImageAdmin);
router.post("/products/import-puja-catalogue", adminController.importPujaCatalogAdmin);
router.delete("/products/:productId", adminController.deleteProductAdmin);
router.get("/pandits/approvals", adminController.listPanditApprovals);
router.patch("/pandits/:panditId/approval", adminController.updatePanditApproval);
router.get("/bookings", adminController.listBookings);
router.patch("/bookings/:bookingId", adminController.updateBooking);
router.delete("/bookings/:bookingId", adminController.deleteBooking);
router.get("/store-orders", adminController.listStoreOrders);
router.patch("/store-orders/:orderId/status", adminController.updateStoreOrderStatus);
router.delete("/store-orders/:orderId", adminController.deleteStoreOrder);
router.get("/withdrawals", adminController.listWithdrawals);
router.patch("/withdrawals/:withdrawalId/status", adminController.updateWithdrawalStatus);
router.delete("/withdrawals/:withdrawalId", adminController.deleteWithdrawal);
router.get("/hawans", adminHawanController.list);
router.post("/hawans", validate(adminCreateSchema), adminHawanController.create);
router.patch("/hawans/:hawanId", validate(adminUpdateSchema), adminHawanController.update);
router.delete("/hawans/:hawanId", validate(idParamSchema), adminHawanController.archive);
router.patch("/hawans/:hawanId/publish", validate(idParamSchema), adminHawanController.publish);
router.patch("/hawans/:hawanId/review", validate(verificationSchema), adminHawanController.review);
router.post("/hawans/:hawanId/duplicate", validate(idParamSchema), adminHawanController.duplicate);

module.exports = router;
