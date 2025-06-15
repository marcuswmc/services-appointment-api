import { Request, Response } from "express";
import ProfessionalService from "../services/professionalService";

class ProfessionalController {
  getAll = async (req: Request, res: Response) => {
    try {
      const professionals = await ProfessionalService.getAll();
      res.json(professionals);
    } catch (error) {
      res.status(500).json({ message: "Failed to get professionals" });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const professional = await ProfessionalService.getById(req.params.id);
      if (!professional)
        res.status(404).json({ message: "Professional not found" });
      res.json(professional);
    } catch (error) {
      res.status(500).json({ message: "Failed to get professional" });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const { name, services } = req.body;
      const image = req.file?.path;

      const newProfessional = await ProfessionalService.create({
        name,
         services: Array.isArray(services) ? services : [services],
        image,
      } as any);

      res.status(201).json(newProfessional);
    } catch (error) {
      res.status(500).json({ message: "Failed to create professional" });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { name, services } = req.body;
      const image = req.file?.path;

      const updateData: any = { name, services };
      if (image) updateData.image = image;

      const updatedProfessional = await ProfessionalService.update(
        req.params.id,
        updateData
      );

      if (!updatedProfessional)
         res.status(404).json({ message: "Professional not found" });

      res.json(updatedProfessional);
    } catch (error) {
      res.status(500).json({ message: "Failed to update professional" });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const deletedProfessional = await ProfessionalService.delete(
        req.params.id
      );
      if (!deletedProfessional)
        res.status(404).json({ message: "Professional not found" });
      res.json(deletedProfessional);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete professional" });
    }
  };
}

export default new ProfessionalController();
