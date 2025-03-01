/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import { IUser } from '../models/userModel.js';
import userService from '../services/userService.js';
import { validationResult } from 'express-validator';

class UserController {
  getAll = async (req: Request, res: Response) => {
    try {
      const users: IUser[] | undefined = await userService.getAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error to get users' });
    }
  };

  getOne = async (req: Request, res: Response) => {
    try {
      const userId: string = req.params.id;
      const user: IUser | null = await userService.getUserById(userId);

      if (!user) {
       res.status(404).json({ error: 'User not found' });
      }

     res.json(user);
    } catch (error) {}
  };

  register = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      
      if (!errors.isEmpty) {
        res.status(422).json({ errors: errors.array() });
      }

      const userToCreate: IUser = req.body;
      const userCreated = await userService.register(userToCreate);
      res.status(201).json(userCreated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const foundUserWithToken: any = await userService.login(email, password);

      if (foundUserWithToken === null) {
        res.status(404).json({ error: 'Invalid email or password' });
      }

     res.json(foundUserWithToken);
    } catch (error) {
      res.status(500).json({ error: 'Failed to login' });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const userId: string = req.params.id;
      const userToUpdate: IUser = req.body;
      const updatedUser = await userService.update(userId, userToUpdate);

      if (!updatedUser) {
        res.status(404).json({ error: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  };

  delete = async (req: Request, res: Response) => {
    try{
      const userId: string = req.params.id;
      const deletedUser = await userService.delete(userId);

      if(!deletedUser){
        res.status(404).json({ error: "User not found" });
      }
      res.json(deletedUser)
    }catch(error){
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
}

export default new UserController();
