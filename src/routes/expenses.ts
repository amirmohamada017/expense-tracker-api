import { Router } from "express";
import { ExpenseController } from "../controllers/expenseController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateRequest, validateQuery } from "../middleware/validation.js";
import { createExpenseSchema, updateExpenseSchema, expenseQuerySchema } from "../middleware/validation.js";

const router = Router();

router.use(authenticateToken);

/**
 * @route   POST /api/expenses
 * @desc    Create a new expense
 * @access  Private
 */
router.post("/", validateRequest(createExpenseSchema), ExpenseController.createExpense);

/**
 * @route   GET /api/expenses
 * @desc    Get all expenses for the authenticated user with optional filters
 * @access  Private
 * @query   period, start_date, end_date, category, min_amount, max_amount, page, limit, sort_by, sort_order
 */
router.get("/", validateQuery(expenseQuerySchema), ExpenseController.getExpenses);

/**
 * @route   GET /api/expenses/stats
 * @desc    Get expense statistics for the authenticated user
 * @access  Private
 * @query   period, start_date, end_date, category
 */
router.get("/stats", ExpenseController.getExpenseStats);

/**
 * @route   GET /api/expenses/:id
 * @desc    Get a specific expense by ID
 * @access  Private
 */
router.get("/:id", ExpenseController.getExpenseById);

/**
 * @route   PUT /api/expenses/:id
 * @desc    Update a specific expense by ID
 * @access  Private
 */
router.put("/:id", validateRequest(updateExpenseSchema), ExpenseController.updateExpense);

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Delete a specific expense by ID
 * @access  Private
 */
router.delete("/:id", ExpenseController.deleteExpense);

export default router;
