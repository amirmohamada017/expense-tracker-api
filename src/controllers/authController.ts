import { Request, Response } from "express";
import { UserService } from "../services/userService.js";
import { CreateUserRequest, LoginRequest, ApiResponse } from "../types/index.js";

export class AuthController {
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const userData: CreateUserRequest = req.body;
            const user = await UserService.createUser(userData);

            const response: ApiResponse = {
                success: true,
                message: "User registered successfully",
                data: { user },
            };

            res.status(201).json(response);
        } catch (error) {
            console.error("Registration error:", error);

            const response: ApiResponse = {
                success: false,
                message: "Registration failed",
                error: error instanceof Error ? error.message : "Unknown error occurred",
            };

            res.status(400).json(response);
        }
    }

    static async login(req: Request, res: Response): Promise<void> {
        try {
            const loginData: LoginRequest = req.body;
            const { user, token } = await UserService.authenticateUser(loginData);

            const response: ApiResponse = {
                success: true,
                message: "Login successful",
                data: { user, token },
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Login error:", error);

            const response: ApiResponse = {
                success: false,
                message: "Login failed",
                error: error instanceof Error ? error.message : "Unknown error occurred",
            };

            res.status(401).json(response);
        }
    }

    static async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;

            if (!userId) {
                const response: ApiResponse = {
                    success: false,
                    message: "User not found in request",
                    error: "Authentication required",
                };
                res.status(401).json(response);
                return;
            }

            const user = await UserService.getUserById(userId);

            if (!user) {
                const response: ApiResponse = {
                    success: false,
                    message: "User not found",
                    error: "User does not exist",
                };
                res.status(404).json(response);
                return;
            }

            const response: ApiResponse = {
                success: true,
                message: "Profile retrieved successfully",
                data: { user },
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Get profile error:", error);

            const response: ApiResponse = {
                success: false,
                message: "Failed to retrieve profile",
                error: error instanceof Error ? error.message : "Unknown error occurred",
            };

            res.status(500).json(response);
        }
    }

    static async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            const updateData = req.body;

            if (!userId) {
                const response: ApiResponse = {
                    success: false,
                    message: "User not found in request",
                    error: "Authentication required",
                };
                res.status(401).json(response);
                return;
            }

            const updatedUser = await UserService.updateUser(userId, updateData);

            const response: ApiResponse = {
                success: true,
                message: "Profile updated successfully",
                data: { user: updatedUser },
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Update profile error:", error);

            const response: ApiResponse = {
                success: false,
                message: "Failed to update profile",
                error: error instanceof Error ? error.message : "Unknown error occurred",
            };

            res.status(400).json(response);
        }
    }
}
