"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const professionalController_1 = __importDefault(require("../controllers/professionalController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.get("/professionals", professionalController_1.default.getAll);
router.get("/professional/:id", professionalController_1.default.getById);
router.post("/professional/create", (0, authMiddleware_1.checkRole)(['ADMIN']), professionalController_1.default.create);
router.put("/professional/:id", (0, authMiddleware_1.checkRole)(['ADMIN']), professionalController_1.default.update);
router.delete("/professional/:id", (0, authMiddleware_1.checkRole)(['ADMIN']), professionalController_1.default.delete);
exports.default = router;
