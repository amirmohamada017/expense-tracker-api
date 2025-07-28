import { prisma } from '../config/database.js';
import {
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseFilters,
  FilterPeriod,
} from '../types/index.js';

export class ExpenseService {
  static async createExpense(userId: number, expenseData: CreateExpenseRequest): Promise<Expense> {
    const expense = await prisma.expense.create({
      data: {
        userId,
        title: expenseData.title,
        description: expenseData.description || "",
        amount: expenseData.amount,
        category: expenseData.category,
        expenseDate: new Date(expenseData.expense_date),
      },
    });

    return {
      id: expense.id,
      user_id: expense.userId,
      title: expense.title,
      description: expense.description || "",
      amount: expense.amount.toNumber(),
      category: expense.category,
      expense_date: expense.expenseDate,
      created_at: expense.createdAt,
      updated_at: expense.updatedAt,
    };
  }

  static async getExpensesByUserId(
    userId: number,
    filters: ExpenseFilters = {}
  ): Promise<{
    expenses: Expense[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  }> {
    const {
      start_date,
      end_date,
      category,
      min_amount,
      max_amount,
      page = 1,
      limit = 10,
      sort_by = 'expense_date',
      sort_order = 'desc',
    } = filters;

    const where: any = { userId };

    if (start_date) {
      where.expenseDate = { ...where.expenseDate, gte: new Date(start_date) };
    }
    if (end_date) {
      where.expenseDate = { ...where.expenseDate, lte: new Date(end_date) };
    }
    if (category) {
      where.category = category;
    }
    if (min_amount !== undefined) {
      where.amount = { ...where.amount, gte: min_amount };
    }
    if (max_amount !== undefined) {
      where.amount = { ...where.amount, lte: max_amount };
    }

    const total = await prisma.expense.count({ where });

    const orderBy: any = {};
    if (sort_by === 'expense_date') {
      orderBy.expenseDate = sort_order;
    } else if (sort_by === 'amount') {
      orderBy.amount = sort_order;
    } else {
      orderBy.createdAt = sort_order;
    }

    // Get expenses
    const expenses = await prisma.expense.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      expenses: expenses.map(expense => ({
        id: expense.id,
        user_id: expense.userId,
        title: expense.title,
        description: expense.description || "",
        amount: expense.amount.toNumber(),
        category: expense.category,
        expense_date: expense.expenseDate,
        created_at: expense.createdAt,
        updated_at: expense.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  static async getExpenseById(userId: number, expenseId: number): Promise<Expense | null> {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, userId },
    });

    if (!expense) return null;

    return {
      id: expense.id,
      user_id: expense.userId,
      title: expense.title,
      description: expense.description || "",
      amount: expense.amount.toNumber(),
      category: expense.category,
      expense_date: expense.expenseDate,
      created_at: expense.createdAt,
      updated_at: expense.updatedAt,
    };
  }

  static async updateExpense(
    userId: number,
    expenseId: number,
    updateData: UpdateExpenseRequest
  ): Promise<Expense> {
    const existingExpense = await prisma.expense.findFirst({
      where: { id: expenseId, userId },
    });

    if (!existingExpense) {
      throw new Error('Expense not found or unauthorized');
    }

    const data: any = {};
    if (updateData.title !== undefined) data.title = updateData.title;
    if (updateData.description !== undefined) data.description = updateData.description;
    if (updateData.amount !== undefined) data.amount = updateData.amount;
    if (updateData.category !== undefined) data.category = updateData.category;
    if (updateData.expense_date !== undefined) data.expenseDate = new Date(updateData.expense_date);

    const expense = await prisma.expense.update({
      where: { id: expenseId },
      data,
    });

    return {
      id: expense.id,
      user_id: expense.userId,
      title: expense.title,
      description: expense.description || "",
      amount: expense.amount.toNumber(),
      category: expense.category,
      expense_date: expense.expenseDate,
      created_at: expense.createdAt,
      updated_at: expense.updatedAt,
    };
  }

  static async deleteExpense(userId: number, expenseId: number): Promise<void> {
    const result = await prisma.expense.deleteMany({
      where: { id: expenseId, userId },
    });

    if (result.count === 0) {
      throw new Error('Expense not found or unauthorized');
    }
  }

  static async getExpenseStats(
    userId: number,
    filters: ExpenseFilters = {}
  ): Promise<{
    total_expenses: number;
    total_amount: number;
    average_amount: number;
    categories: Array<{
      category: string;
      count: number;
      total_amount: number;
    }>;
  }> {
    const { start_date, end_date, category } = filters;

    const where: any = { userId };

    if (start_date) {
      where.expenseDate = { ...where.expenseDate, gte: new Date(start_date) };
    }
    if (end_date) {
      where.expenseDate = { ...where.expenseDate, lte: new Date(end_date) };
    }
    if (category) {
      where.category = category;
    }

    const expenses = await prisma.expense.findMany({ where });

    const total_expenses = expenses.length;
    const total_amount = expenses.reduce(
      (sum, expense) => sum + expense.amount.toNumber(),
      0
    );
    const average_amount = total_expenses > 0 ? total_amount / total_expenses : 0;

    const categoryStats = await prisma.expense.groupBy({
      by: ['category'],
      where,
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    const categories = categoryStats.map((stat: any) => ({
      category: stat.category,
      count: stat._count.id,
      total_amount: stat._sum.amount?.toNumber() || 0,
    }));

    return {
      total_expenses,
      total_amount,
      average_amount,
      categories,
    };
  }

  static getDateRangeForPeriod(period: FilterPeriod): { start_date: string; end_date: string } {
    const now = new Date();
    const endDate = now.toISOString().split('T')[0];
    let startDate: string;

    switch (period) {
      case FilterPeriod.PAST_WEEK:
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0] as string;
        break;

      case FilterPeriod.PAST_MONTH:
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        startDate = monthAgo.toISOString().split('T')[0] as string;
        break;

      case FilterPeriod.LAST_3_MONTHS:
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        startDate = threeMonthsAgo.toISOString().split('T')[0] as string;
        break;

      default:
        throw new Error('Invalid period specified');
    }

    return { start_date: startDate, end_date: endDate as string };
  }
}
