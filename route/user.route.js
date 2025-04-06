const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");

const userController = require("../controller/user.controller");

router.get("/", userController.hello);
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/preferences", authMiddleware, userController.preferences);
router.put("/preferences", authMiddleware, userController.updatePreferences);
router.get("/news", authMiddleware, userController.news);

module.exports = router;
