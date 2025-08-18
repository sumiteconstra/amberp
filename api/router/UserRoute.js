
const express = require("express");
const { Register, Login, GetAllUser, GetAllUserCount, GetAllRole, UpdateUser, GetPermission, ChangePassword } = require("../controller/UserController");
const { authToken } = require("../utils/Middleware");

 
const router = express.Router();
router.post('/register', Register);
router.post('/login', Login);
router.get('/all-user',authToken, GetAllUser);
router.get('/allusercount', authToken,GetAllUserCount);
router.post('/change-password', authToken, ChangePassword)

router.get('/get-role',authToken, GetAllRole);
router.post('/update-user',authToken, UpdateUser);
router.get('/get-permission',authToken, GetPermission);
//router.get('/allusercount', authToken,GetAllUserCount);//
// Define Routes

module.exports = router;
