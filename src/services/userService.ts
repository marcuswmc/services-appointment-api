import { IUser } from "../models/userModel";
import userModel from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';


dotenv.config();

class UserService {
  getAll = async (): Promise<IUser[]> => {
    try {
      return await userModel.find();
    } catch (error) {
      throw new Error('Failed to get all users');
    }
  };

  getUserById = async (userId: string): Promise<IUser | null> => {
    try {
      const foundUser: IUser | null = await userModel.findById(userId);

      return foundUser;
    } catch (error) {
      throw new Error('Failed to get user by ID');
    }
  };

  register = async (newUser: IUser): Promise<IUser> => {
    try {
      const foundUser = await userModel.findOne({ email: newUser.email });
      if (foundUser) {
        throw new Error('User already exists');
      }

      const hashedPass = await bcrypt.hash(newUser.password, 10);
      newUser.password = hashedPass;

      const createdUser = await userModel.create(newUser);
      return createdUser;
    } catch (error) {
      throw new Error('Failed to create user');
    }
  };

  login = async (email: string, password: string): Promise<{ user: IUser; accessToken: string } | null> => {
    try {
      const foundUser = await userModel.findOne({ email: email });

      if (!foundUser) {
        return null;
      }

      if (!(await bcrypt.compare(password, foundUser.password))) {
        return null;
      }

      let token = '';
      if (process.env.SECRET_KEY) {
        token = jwt.sign(
          {
            id: foundUser._id,
            email: foundUser.email,
            role: foundUser.role,
          },
          process.env.SECRET_KEY,
        );
      } else {
        throw new Error('SECRET_KEY is not set');
      }

      return { user: foundUser, accessToken: token };
    } catch (error) {
      throw new Error('Failed to login');
    }
  };

  update = (userId: string, user: IUser): Promise<IUser | null> => {
    try {
      const updatedUser = userModel.findByIdAndUpdate(userId, user, { new: true });
      return updatedUser;
    } catch (error) {
      throw new Error('Failed to update user');
    }
  };
  
  delete = async (userId: string): Promise<IUser | null> => {
    try{
      const deletedUser = await userModel.findByIdAndDelete(userId);
      return deletedUser;
    }catch(error){
      throw new Error('Failed to delete user');
    }
  };
}

export default new UserService();
