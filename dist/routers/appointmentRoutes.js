"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointmentController_1 = __importDefault(require("../controllers/appointmentController"));
const router = (0, express_1.Router)();
router.get("/appointments", appointmentController_1.default.getAll);
router.get("/appointment/:id", appointmentController_1.default.getById);
router.post("/appointment/create", appointmentController_1.default.create);
router.patch("/appointment/:id", appointmentController_1.default.updateStatus);
exports.default = router;
