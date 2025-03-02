import { Request, Response } from "express";
import ServiceService from "../services/servicesService";

class ServiceController {
  getAll = async (req: Request, res: Response) => {
    try {
      const services = await ServiceService.getAll();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to get services" });
    }
  };

  getAvailableServices = async (req: Request, res: Response) => {
    try {
      const { date } = req.query;

      if (!date) {
       res.status(400).json({ error: "Date query parameter is required" });
      }

      const services = await ServiceService.getAllWithAvailableTimes(date as string);
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  }
  

  getById = async (req: Request, res: Response) => {
    try {
      const service = await ServiceService.getById(req.params.id);
      if (!service) res.status(404).json({ message: "Service not found" });
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to get service" });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const newService = await ServiceService.create(req.body);
      res.status(201).json(newService);
    } catch (error) {
      res.status(500).json({ message: "Failed to create service" });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const updatedService = await ServiceService.update(req.params.id, req.body);
      if (!updatedService) res.status(404).json({ message: "Service not found" });
      res.json(updatedService);
    } catch (error) {
      res.status(500).json({ message: "Failed to update service" });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const deletedService = await ServiceService.delete(req.params.id);
      if (!deletedService) res.status(404).json({ message: "Service not found" });
      res.json(deletedService);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service" });
    }
  };
}

export default new ServiceController();
