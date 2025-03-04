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
const appointmentModel_1 = __importDefault(require("../models/appointmentModel"));
const servicesModel_1 = __importDefault(require("../models/servicesModel"));
class ServicesService {
    constructor() {
        this.getAll = () => __awaiter(this, void 0, void 0, function* () {
            return yield servicesModel_1.default.find();
        });
        this.getAllWithAvailableTimes = (date) => __awaiter(this, void 0, void 0, function* () {
            try {
                const services = yield servicesModel_1.default.find();
                const updatedServices = yield Promise.all(services.map((service) => __awaiter(this, void 0, void 0, function* () {
                    const bookedAppointments = yield appointmentModel_1.default.find({
                        serviceId: service._id,
                        date: date.trim(),
                    });
                    const bookedTimes = bookedAppointments.map((appt) => appt.time.trim()); // Normaliza horários
                    const availableTimes = service.availableTimes.filter((time) => !bookedTimes.includes(time.trim()));
                    if (availableTimes.length === 0)
                        return null;
                    return Object.assign(Object.assign({}, service.toObject()), { availableTimes });
                })));
                return updatedServices.filter((service) => service !== null);
            }
            catch (error) {
                throw new Error("Failed to get services with available times");
            }
        });
        this.getById = (id) => __awaiter(this, void 0, void 0, function* () {
            return yield servicesModel_1.default.findById(id);
        });
        this.create = (data) => __awaiter(this, void 0, void 0, function* () {
            return yield servicesModel_1.default.create(data);
        });
        this.update = (id, data) => __awaiter(this, void 0, void 0, function* () {
            return yield servicesModel_1.default.findByIdAndUpdate(id, data, { new: true });
        });
        this.delete = (id) => __awaiter(this, void 0, void 0, function* () {
            return yield servicesModel_1.default.findByIdAndDelete(id);
        });
    }
}
exports.default = new ServicesService();
