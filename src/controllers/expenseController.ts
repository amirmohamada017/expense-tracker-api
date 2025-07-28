import { Request, Response } from "express";
import { ExpenseService } from "../services/expenseService.js";
import { CreateExpenseRequest, UpdateExpenseRequest, ExpenseFilters, ApiResponse } from "../types/index.js";

export class ExpenseController {
    static async createExpense(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            const expenseData: CreateExpenseRequest = req.body;

            if (!userId) {
                const response: ApiResponse = {
                    success: false,
                    message: "User not found in request",
                    error: "Authentication required",
                };
                res.status(401).json(response);
                return;
            }

            const expense = await ExpenseService.createExpense(userId, expenseData);

            const response: ApiResponse = {
                success: true,
                message: "Expense created successfully",
                data: { expense },
            };

            res.status(201).json(response);
        } catch (error) {
            console.error("Create expense error:", error);

            const response: ApiResponse = {
                success: false,
                message: "Failed to create expense",
                error: error instanceof Error ? error.message : "Unknown error occurred",
            };

            res.status(400).json(response);
        }
    }

    static async getExpenses(req: Request, res: Response): Promise<void> {
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

            const filters: ExpenseFilters = { ...req.query } as any;

            if (filters.start_date && filters.end_date) {
                const start = new Date(filters.start_date);
                const end = new Date(filters.end_date);
                if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
                    const response: ApiResponse = {
                        success: false,
                        message: "Invalid date range",
                        error: "start_date and end_date must be valid dates, and start_date must be before end_date",
                    };
                    res.status(400).json(response);
                    return;
                }
            }

            // Convert string parameters to appropriate types
            if (filters.page) filters.page = parseInt(filters.page.toString(), 10);
            if (filters.limit) filters.limit = parseInt(filters.limit.toString(), 10);
            if (filters.min_amount) filters.min_amount = parseFloat(filters.min_amount.toString());
            if (filters.max_amount) filters.max_amount = parseFloat(filters.max_amount.toString());

            const result = await ExpenseService.getExpensesByUserId(userId, filters);

            const response: ApiResponse = {
                success: true,
                message: "Expenses retrieved successfully",
                data: { expenses: result.expenses },
                pagination: result.pagination,
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Get expenses error:", error);

            const response: ApiResponse = {
                success: false,
                message: "Failed to retrieve expenses",
                error: error instanceof Error ? error.message : "Unknown error occurred",
            };

            res.status(500).json(response);
        }
    }

    static async getExpenseById(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;

            const expenseId = parseInt(req.params["id"] || "", 10);

            if (!userId) {
                const response: ApiResponse = {
                    success: false,
                    message: "User not found in request",
                    error: "Authentication required",
                };
                res.status(401).json(response);
                return;
            }

            if (isNaN(expenseId)) {
                const response: ApiResponse = {
                    success: false,
                    message: "Invalid expense ID",
                    error: "Expense ID must be a valid number",
                };
                res.status(400).json(response);
                return;
            }

            const expense = await ExpenseService.getExpenseById(userId, expenseId);

            if (!expense) {
                const response: ApiResponse = {
                    success: false,
                    message: "Expense not found",
                    error: "The specified expense does not exist or you do not have permission to access it",
                };
                res.status(404).json(response);
                return;
            }

            const response: ApiResponse = {
                success: true,
                message: "Expense retrieved successfully",
                data: { expense },
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Get expense by ID error:", error);

            const response: ApiResponse = {
                success: false,
                message: "Failed to retrieve expense",
                error: error instanceof Error ? error.message : "Unknown error occurred",
            };

            res.status(500).json(response);
        }
    }

    static async updateExpense(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            const expenseId = parseInt(req.params["id"] || "", 10);
            const updateData: UpdateExpenseRequest = req.body;

            if (!userId) {
                const response: ApiResponse = {
                    success: false,
                    message: "User not found in request",
                    error: "Authentication required",
                };
                res.status(401).json(response);
                return;
            }

            if (isNaN(expenseId)) {
                const response: ApiResponse = {
                    success: false,
                    message: "Invalid expense ID",
                    error: "Expense ID must be a valid number",
                };
                res.status(400).json(response);
                return;
            }

            const updatedExpense = await ExpenseService.updateExpense(userId, expenseId, updateData);

            const response: ApiResponse = {
                success: true,
                message: "Expense updated successfully",
                data: { expense: updatedExpense },
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Update expense error:", error);

            const response: ApiResponse = {
                success: false,
                message: "Failed to update expense",
                error: error instanceof Error ? error.message : "Unknown error occurred",
            };

            const statusCode = error instanceof Error && error.message.includes("not found") ? 404 : 400;
            res.status(statusCode).json(response);
        }
    }

    static async deleteExpense(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            const expenseId = parseInt(req.params["id"] || "", 10);

            if (!userId) {
                const response: ApiResponse = {
                    success: false,
                    message: "User not found in request",
                    error: "Authentication required",
                };
                res.status(401).json(response);
                return;
            }

            if (isNaN(expenseId)) {
                const response: ApiResponse = {
                    success: false,
                    message: "Invalid expense ID",
                    error: "Expense ID must be a valid number",
                };
                res.status(400).json(response);
                return;
            }

            await ExpenseService.deleteExpense(userId, expenseId);

            const response: ApiResponse = {
                success: true,
                message: "Expense deleted successfully",
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Delete expense error:", error);

            const response: ApiResponse = {
                success: false,
                message: "Failed to delete expense",
                error: error instanceof Error ? error.message : "Unknown error occurred",
            };

            const statusCode = error instanceof Error && error.message.includes("not found") ? 404 : 400;
            res.status(statusCode).json(response);
        }
    }

    static async getExpenseStats(req: Request, res: Response): Promise<void> {
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

            // Parse query parameters for filtering stats
            const filters: ExpenseFilters = { ...req.query } as any;

            // Handle period-based filtering
            if (filters.start_date && filters.end_date) {
                const start = new Date(filters.start_date);
                const end = new Date(filters.end_date);
                if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
                    const response: ApiResponse = {
                        success: false,
                        message: "Invalid date range",
                        error: "start_date and end_date must be valid dates, and start_date must be before end_date",
                    };
                    res.status(400).json(response);
                    return;
                }
            }

            const stats = await ExpenseService.getExpenseStats(userId, filters);

            const response: ApiResponse = {
                success: true,
                message: "Expense statistics retrieved successfully",
                data: { stats },
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Get expense stats error:", error);

            const response: ApiResponse = {
                success: false,
                message: "Failed to retrieve expense statistics",
                error: error instanceof Error ? error.message : "Unknown error occurred",
            };

            res.status(500).json(response);
        }
    }
}
