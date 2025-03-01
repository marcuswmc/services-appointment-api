import { Request, Response } from "express";
import Service from "../models/serviceModel";

export const getServices = async (_req: Request, res: Response) => {
  try{
    const services = await Service.find();
    res.json(services);
  }catch (error) {
    res.status(500).json({message: "Error to find services"})
  }
}
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "can not find service" });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: "Error to find service", error });
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const { name, price, duration, availableHours } = req.body;
    const newService = new Service({ name, price, duration, availableHours });
    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar serviço", error });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedService) return res.status(404).json({ message: "Serviço não encontrado" });
    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar serviço", error });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Serviço deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar serviço", error });
  }
};
