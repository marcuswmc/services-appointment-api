"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = checkRole;
/* eslint-disable @typescript-eslint/no-explicit-any */
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const secretKey = process.env.SECRET_KEY || "";
function checkRole(roles) {
    return function (req, res, next) {
        var _a;
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(401).json({ error: "Unauthorized. No token provided." });
            return;
        }
        try {
            const decodedToken = jsonwebtoken_1.default.verify(token, secretKey);
            if (!roles.includes(decodedToken.role)) {
                res.status(403).json({
                    error: "Access forbidden. User does't have the required role",
                });
                return;
            }
            next();
        }
        catch (error) {
            res.status(403).json({
                error: "Access forbidden. Invalid or expired token."
            });
            return;
        }
    };
}
