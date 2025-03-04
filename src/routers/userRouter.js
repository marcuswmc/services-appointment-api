"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_js_1 = __importDefault(require("../controllers/userController.js"));
const express_validator_1 = require("express-validator");
const authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
const router = (0, express_1.Router)();
// Get all users
router.get('/users', (0, authMiddleware_js_1.checkRole)(['ADMIN']), userController_js_1.default.getAll);
// Get user by ID
router.get('/users/:id', (0, authMiddleware_js_1.checkRole)(['ADMIN']), userController_js_1.default.getOne);
// Register a new user
router.post('/register', [
    (0, express_validator_1.check)('name').notEmpty().withMessage('User name is required.'),
    (0, express_validator_1.check)('email').isEmail().withMessage('Invalid email format'),
    (0, express_validator_1.check)('password').isStrongPassword(),
    (0, express_validator_1.check)('role').isIn(['USER', 'ADMIN']).withMessage('Invalid role'),
], userController_js_1.default.register);
// Login user
router.post('/login', [
    (0, express_validator_1.check)('email').isEmail().withMessage('Invalid email format'),
    (0, express_validator_1.check)('password').notEmpty().withMessage('Password is required'),
], userController_js_1.default.login);
// Update an existing user
router.put('/users/:id', (0, authMiddleware_js_1.checkRole)(['ADMIN']), userController_js_1.default.update);
// Delete an existing user
router.delete('/users/:id', (0, authMiddleware_js_1.checkRole)(['ADMIN']), userController_js_1.default.delete);
exports.default = router;
