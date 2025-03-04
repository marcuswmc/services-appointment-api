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
const userModel_1 = __importDefault(require("../models/userModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class UserService {
    constructor() {
        this.getAll = () => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield userModel_1.default.find();
            }
            catch (error) {
                throw new Error('Failed to get all users');
            }
        });
        this.getUserById = (userId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const foundUser = yield userModel_1.default.findById(userId);
                return foundUser;
            }
            catch (error) {
                throw new Error('Failed to get user by ID');
            }
        });
        this.register = (newUser) => __awaiter(this, void 0, void 0, function* () {
            try {
                const foundUser = yield userModel_1.default.findOne({ email: newUser.email });
                if (foundUser) {
                    throw new Error('User already exists');
                }
                const hashedPass = yield bcrypt_1.default.hash(newUser.password, 10);
                newUser.password = hashedPass;
                const createdUser = yield userModel_1.default.create(newUser);
                return createdUser;
            }
            catch (error) {
                throw new Error('Failed to create user');
            }
        });
        this.login = (email, password) => __awaiter(this, void 0, void 0, function* () {
            try {
                const foundUser = yield userModel_1.default.findOne({ email: email });
                if (!foundUser) {
                    return null;
                }
                if (!(yield bcrypt_1.default.compare(password, foundUser.password))) {
                    return null;
                }
                let token = '';
                if (process.env.SECRET_KEY) {
                    token = jsonwebtoken_1.default.sign({
                        id: foundUser._id,
                        email: foundUser.email,
                        role: foundUser.role,
                    }, process.env.SECRET_KEY);
                }
                else {
                    throw new Error('SECRET_KEY is not set');
                }
                return { user: foundUser, accessToken: token };
            }
            catch (error) {
                throw new Error('Failed to login');
            }
        });
        this.update = (userId, user) => {
            try {
                const updatedUser = userModel_1.default.findByIdAndUpdate(userId, user, { new: true });
                return updatedUser;
            }
            catch (error) {
                throw new Error('Failed to update user');
            }
        };
        this.delete = (userId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const deletedUser = yield userModel_1.default.findByIdAndDelete(userId);
                return deletedUser;
            }
            catch (error) {
                throw new Error('Failed to delete user');
            }
        });
    }
}
exports.default = new UserService();
