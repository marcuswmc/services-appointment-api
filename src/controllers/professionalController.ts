import { Request, Response } from "express";
import Professional from "../models/professionalModel";

export const getProfessionals = async (_req: Request, res: Response) => {
  try {
    const professionals = await Professional.find();
    res.json(professionals);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar profissionais", error });
  }
};

export const getProfessionalById = async (req: Request, res: Response) => {
  try {
    const professional = await Professional.findById(req.params.id);
    if (!professional) return res.status(404).json({ message: "Profissional não encontrado" });
    res.json(professional);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar profissional", error });
  }
};

export const createProfessional = async (req: Request, res: Response) => {
  try {
    const { name, specialty } = req.body;
    const newProfessional = new Professional({ name, specialty });
    await newProfessional.save();
    res.status(201).json(newProfessional);
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar profissional", error });
  }
};

export const updateProfessional = async (req: Request, res: Response) => {
  try {
    const updatedProfessional = await Professional.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProfessional) return res.status(404).json({ message: "Profissional não encontrado" });
    res.json(updatedProfessional);
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar profissional", error });
  }
};

export const deleteProfessional = async (req: Request, res: Response) => {
  try {
    await Professional.findByIdAndDelete(req.params.id);
    res.json({ message: "Profissional deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar profissional", error });
  }
};
