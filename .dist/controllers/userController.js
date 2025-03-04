"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userService_js_1 = __importDefault(require("../services/userService.js"));
const express_validator_1 = require("express-validator");
class UserController {
    constructor() {
        this.getAll = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield userService_js_1.default.getAll();
                res.json(users);
            }
            catch (error) {
                res.status(500).json({ message: 'Error to get users' });
            }
        });
        this.getOne = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const user = yield userService_js_1.default.getUserById(userId);
                if (!user) {
                    res.status(404).json({ error: 'User not found' });
                }
                res.json(user);
            }
            catch (error) { }
        });
        this.register = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty) {
                    res.status(422).json({ errors: errors.array() });
                }
                const userToCreate = req.body;
                const userCreated = yield userService_js_1.default.register(userToCreate);
                res.status(201).json(userCreated);
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to create user' });
            }
        });
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(422).json({ errors: errors.array() });
                    return;
                }
                const { email, password } = req.body;
                const foundUserWithToken = yield userService_js_1.default.login(email, password);
                if (!foundUserWithToken) {
                    res.status(404).json({ error: 'Invalid email or password' });
                    return;
                }
                const { user, accessToken } = foundUserWithToken;
                res.json({
                    user,
                    token: accessToken, // Mudando de "accessToken" para "token"
                    expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                });
            }
            catch (error) {
                console.error("Login error:", error);
                res.status(500).json({ error: 'Failed to login' });
            }
        });
        this.update = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const userToUpdate = req.body;
                const updatedUser = yield userService_js_1.default.update(userId, userToUpdate);
                if (!updatedUser) {
                    res.status(404).json({ error: "User not found" });
                }
                res.json(updatedUser);
            }
            catch (error) {
                res.status(500).json({ error: "Failed to update user" });
            }
        });
        this.delete = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const deletedUser = yield userService_js_1.default.delete(userId);
                if (!deletedUser) {
                    res.status(404).json({ error: "User not found" });
                }
                res.json(deletedUser);
            }
            catch (error) {
                res.status(500).json({ error: "Failed to delete user" });
            }
        });
    }
}
exports.default = new UserController();
