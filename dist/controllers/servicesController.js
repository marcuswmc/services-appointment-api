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
const servicesService_1 = __importDefault(require("../services/servicesService"));
class ServiceController {
    constructor() {
        this.getAll = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const services = yield servicesService_1.default.getAll();
                res.json(services);
            }
            catch (error) {
                res.status(500).json({ message: "Failed to get services" });
            }
        });
        this.getAvailableServices = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { date } = req.query;
                if (!date) {
                    res.status(400).json({ error: "Date query parameter is required" });
                }
                const services = yield servicesService_1.default.getAllWithAvailableTimes(date);
                res.json(services);
            }
            catch (error) {
                res.status(500).json({ error: "Failed to fetch services" });
            }
        });
        this.getById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const service = yield servicesService_1.default.getById(req.params.id);
                if (!service)
                    res.status(404).json({ message: "Service not found" });
                res.json(service);
            }
            catch (error) {
                res.status(500).json({ message: "Failed to get service" });
            }
        });
        this.create = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const newService = yield servicesService_1.default.create(req.body);
                res.status(201).json(newService);
            }
            catch (error) {
                res.status(500).json({ message: "Failed to create service" });
            }
        });
        this.update = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedService = yield servicesService_1.default.update(req.params.id, req.body);
                if (!updatedService)
                    res.status(404).json({ message: "Service not found" });
                res.json(updatedService);
            }
            catch (error) {
                res.status(500).json({ message: "Failed to update service" });
            }
        });
        this.delete = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const deletedService = yield servicesService_1.default.delete(req.params.id);
                if (!deletedService)
                    res.status(404).json({ message: "Service not found" });
                res.json(deletedService);
            }
            catch (error) {
                res.status(500).json({ message: "Failed to delete service" });
            }
        });
    }
}
exports.default = new ServiceController();
