const express = require("express");
const router = express.Router();
const {
  signupUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/authController");

router.post("/signup", signupUser);
router.post("/login", loginUser);

router.get("/getall", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/delete/:id", deleteUser);

module.exports = router;