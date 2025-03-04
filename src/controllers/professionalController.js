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
const professionalService_1 = __importDefault(require("../services/professionalService"));
class ProfessionalController {
    constructor() {
        this.getAll = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const professionals = yield professionalService_1.default.getAll();
                res.json(professionals);
            }
            catch (error) {
                res.status(500).json({ message: "Failed to get professionals" });
            }
        });
        this.getById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const professional = yield professionalService_1.default.getById(req.params.id);
                if (!professional)
                    res.status(404).json({ message: "Professional not found" });
                res.json(professional);
            }
            catch (error) {
                res.status(500).json({ message: "Failed to get professional" });
            }
        });
        this.create = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const newProfessional = yield professionalService_1.default.create(req.body);
                res.status(201).json(newProfessional);
            }
            catch (error) {
                res.status(500).json({ message: "Failed to create professional" });
            }
        });
        this.update = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedProfessional = yield professionalService_1.default.update(req.params.id, req.body);
                if (!updatedProfessional)
                    res.status(404).json({ message: "Professional not found" });
                res.json(updatedProfessional);
            }
            catch (error) {
                res.status(500).json({ message: "Failed to update professional" });
            }
        });
        this.delete = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const deletedProfessional = yield professionalService_1.default.delete(req.params.id);
                if (!deletedProfessional)
                    res.status(404).json({ message: "Professional not found" });
                res.json(deletedProfessional);
            }
            catch (error) {
                res.status(500).json({ message: "Failed to delete professional" });
            }
        });
    }
}
exports.default = new ProfessionalController();
