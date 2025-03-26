import { Request, Response } from "express";
import CategoryModel from "../models/categoryModel";

class CategoryController {
  getAll = async (req: Request, res: Response) => {
    try {
      const categories = await CategoryModel.find();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to get categories" });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const newCategory = await CategoryModel.create(req.body);
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category" });
    }
  };
}

export default new CategoryController();
