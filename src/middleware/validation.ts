import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validateRequest = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errorMessages = error.details.map((detail) => detail.message);
            res.status(400).json({
                success: false,
                message: "Validation error",
                error: errorMessages.join(", "),
            });
            return;
        }

        next();
    };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error } = schema.validate(req.query, { abortEarly: false });

        if (error) {
            const errorMessages = error.details.map((detail) => detail.message);
            res.status(400).json({
                success: false,
                message: "Query validation error",
                error: errorMessages.join(", "),
            });
            return;
        }

        next();
    };
};

export const registerSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
    }),
    password: Joi.string()
        .min(8)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]"))
        .required()
        .messages({
            "string.min": "Password must be at least 8 characters long",
            "string.pattern.base":
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            "any.required": "Password is required",
        }),
    first_name: Joi.string().min(2).max(50).required().messages({
        "string.min": "First name must be at least 2 characters long",
        "string.max": "First name cannot exceed 50 characters",
        "any.required": "First name is required",
    }),
    last_name: Joi.string().min(2).max(50).required().messages({
        "string.min": "Last name must be at least 2 characters long",
        "string.max": "Last name cannot exceed 50 characters",
        "any.required": "Last name is required",
    }),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
        "any.required": "Password is required",
    }),
});

export const createExpenseSchema = Joi.object({
    title: Joi.string().min(1).max(255).required().messages({
        "string.min": "Title cannot be empty",
        "string.max": "Title cannot exceed 255 characters",
        "any.required": "Title is required",
    }),
    description: Joi.string().max(1000).optional().allow("").messages({
        "string.max": "Description cannot exceed 1000 characters",
    }),
    amount: Joi.number().positive().precision(2).required().messages({
        "number.positive": "Amount must be a positive number",
        "any.required": "Amount is required",
    }),
    category: Joi.string()
        .valid("food", "transportation", "entertainment", "utilities", "healthcare", "shopping", "travel", "education", "other")
        .required()
        .messages({
            "any.only":
                "Category must be one of: food, transportation, entertainment, utilities, healthcare, shopping, travel, education, other",
            "any.required": "Category is required",
        }),
    expense_date: Joi.date().iso().max("now").required().messages({
        "date.format": "Expense date must be in ISO format (YYYY-MM-DD)",
        "date.max": "Expense date cannot be in the future",
        "any.required": "Expense date is required",
    }),
});

export const updateExpenseSchema = Joi.object({
    title: Joi.string().min(1).max(255).optional().messages({
        "string.min": "Title cannot be empty",
        "string.max": "Title cannot exceed 255 characters",
    }),
    description: Joi.string().max(1000).optional().allow("").messages({
        "string.max": "Description cannot exceed 1000 characters",
    }),
    amount: Joi.number().positive().precision(2).optional().messages({
        "number.positive": "Amount must be a positive number",
    }),
    category: Joi.string()
        .valid("food", "transportation", "entertainment", "utilities", "healthcare", "shopping", "travel", "education", "other")
        .optional()
        .messages({
            "any.only":
                "Category must be one of: food, transportation, entertainment, utilities, healthcare, shopping, travel, education, other",
        }),
    expense_date: Joi.date().iso().max("now").optional().messages({
        "date.format": "Expense date must be in ISO format (YYYY-MM-DD)",
        "date.max": "Expense date cannot be in the future",
    }),
})
    .min(1)
    .messages({
        "object.min": "At least one field must be provided for update",
    });

export const expenseQuerySchema = Joi.object({
    period: Joi.string().valid("past_week", "past_month", "last_3_months", "custom").optional(),
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().min(Joi.ref("start_date")).optional(),
    category: Joi.string()
        .valid("food", "transportation", "entertainment", "utilities", "healthcare", "shopping", "travel", "education", "other")
        .optional(),
    min_amount: Joi.number().positive().optional(),
    max_amount: Joi.number().positive().min(Joi.ref("min_amount")).optional(),
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(10).optional(),
    sort_by: Joi.string().valid("expense_date", "amount", "created_at").default("expense_date").optional(),
    sort_order: Joi.string().valid("asc", "desc").default("desc").optional(),
})
    .and("start_date", "end_date")
    .messages({
        "object.and": "Both start_date and end_date must be provided when using custom date range",
    });
