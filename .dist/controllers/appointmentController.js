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
const appointmentService_1 = __importDefault(require("../services/appointmentService"));
class AppointmentController {
    constructor() {
        this.getAll = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const appointments = yield appointmentService_1.default.getAll();
                res.json(appointments);
            }
            catch (error) {
                res.status(500).json({ message: "Failed to get appointments" });
            }
        });
        this.getById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const appointment = yield appointmentService_1.default.getById(req.params.id);
                if (!appointment) {
                    res.status(404).json({ message: "Appointment not found" });
                }
                res.json(appointment);
            }
            catch (error) {
                res.status(500).json({ message: "Failed to get appointment" });
            }
        });
        this.create = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const newAppointment = yield appointmentService_1.default.create(req.body);
                res.status(201).json(newAppointment);
            }
            catch (error) {
                console.error("Failed to create appointment:", error);
                res.status(500).json({ message: "Failed to create appointment", error: error.message });
            }
        });
        this.updateStatus = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { status } = req.body;
                const { id } = req.params;
                if (!["CANCELED", "FINISHED"].includes(status)) {
                    res.status(400).json({ message: "Invalid status" });
                }
                const updatedAppointment = yield appointmentService_1.default.updateStatus(id, status);
                if (!updatedAppointment) {
                    res.status(404).json({ message: "Appointment not found" });
                }
                res.json(updatedAppointment);
            }
            catch (error) {
                res.status(500).json({ message: "Failed to update appointment status" });
            }
        });
    }
}
exports.default = new AppointmentController();
