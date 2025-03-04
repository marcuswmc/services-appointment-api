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
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const userRouter_1 = __importDefault(require("./routers/userRouter"));
const servicesRoutes_1 = __importDefault(require("./routers/servicesRoutes"));
const professionalRoutes_1 = __importDefault(require("./routers/professionalRoutes"));
const appointmentRoutes_1 = __importDefault(require("./routers/appointmentRoutes"));
const PORT = process.env.PORT || 5000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));
app.use(express_1.default.json());
app.use('/api', userRouter_1.default);
app.use('/api', appointmentRoutes_1.default);
app.use('/api', servicesRoutes_1.default);
app.use('/api', professionalRoutes_1.default);
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        mongoose_1.default.set('strictQuery', true);
        yield mongoose_1.default.connect(String(process.env.MONGO_URI));
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            if (process.env.NODE_ENV === 'prod') {
                console.log(`Server is running in production mode on port ${PORT}`);
            }
            else {
                console.log(`Server is running in development mode on port ${PORT}`);
            }
        });
    }
    catch (err) {
        if (err instanceof Error) {
            console.error('Error connecting to database', err.message);
        }
    }
});
connectDB();
