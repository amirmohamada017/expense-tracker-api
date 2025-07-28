export interface User {
    id: number;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateUserRequest {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface UserResponse {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    created_at: Date;
    updated_at: Date;
}

export interface Expense {
    id: number;
    user_id: number;
    title: string;
    description?: string;
    amount: number;
    category: string;
    expense_date: Date;
    created_at: Date;
    updated_at: Date;
}

export interface CreateExpenseRequest {
    title: string;
    description?: string;
    amount: number;
    category: string;
    expense_date: string;
}

export interface UpdateExpenseRequest {
    title?: string;
    description?: string;
    amount?: number;
    category?: string;
    expense_date?: string;
}

export interface ExpenseFilters {
    start_date?: string;
    end_date?: string;
    category?: string;
    min_amount?: number;
    max_amount?: number;
    page?: number;
    limit?: number;
    sort_by?: "expense_date" | "amount" | "created_at";
    sort_order?: "asc" | "desc";
}

export interface JwtPayload {
    userId: number;
    email: string;
}

export interface AuthRequest extends Request {
    user?: JwtPayload;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}

export enum ExpenseCategory {
    FOOD = "food",
    TRANSPORTATION = "transportation",
    ENTERTAINMENT = "entertainment",
    UTILITIES = "utilities",
    HEALTHCARE = "healthcare",
    SHOPPING = "shopping",
    TRAVEL = "travel",
    EDUCATION = "education",
    OTHER = "other",
}

export enum FilterPeriod {
    PAST_WEEK = "past_week",
    PAST_MONTH = "past_month",
    LAST_3_MONTHS = "last_3_months",
    CUSTOM = "custom",
}
