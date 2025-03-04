"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const servicesController_1 = __importDefault(require("../controllers/servicesController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.get("/services", servicesController_1.default.getAll);
router.get("/services/available", servicesController_1.default.getAvailableServices);
router.get("/service/:id", servicesController_1.default.getById);
router.post("/service/create", (0, authMiddleware_1.checkRole)(['ADMIN']), servicesController_1.default.create);
router.put("/service/:id", (0, authMiddleware_1.checkRole)(['ADMIN']), servicesController_1.default.update);
router.delete("/service/:id", (0, authMiddleware_1.checkRole)(['ADMIN']), servicesController_1.default.delete);
exports.default = router;
