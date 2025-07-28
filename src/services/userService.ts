import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { CreateUserRequest, LoginRequest, UserResponse, JwtPayload } from '../types/index.js';
import { Expense } from '../generated/prisma/index.js';

export class UserService {
  private static readonly SALT_ROUNDS = 12;

  static async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    const { email, password, first_name, last_name } = userData;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: first_name,
        lastName: last_name,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  static async getExpenseById(userId: number, expenseId: number): Promise<Expense | null> {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, userId },
    });

    if (!expense) return null;

    return {
      id: expense.id,
      userId: expense.userId,
      title: expense.title,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      expenseDate: expense.expenseDate,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }

  static async authenticateUser(loginData: LoginRequest): Promise<{
    user: UserResponse;
    token: string;
  }> {
    const { email, password } = loginData;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: process.env['JWT_EXPIRES_IN'] || '7d',
    } as SignOptions);

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      },
      token,
    };
  }

  static async getUserById(userId: number): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  static async updateUser(
    userId: number,
    updateData: Partial<CreateUserRequest>
  ): Promise<UserResponse> {
    const data: any = {};

    if (updateData.first_name) data.firstName = updateData.first_name;
    if (updateData.last_name) data.lastName = updateData.last_name;
    if (updateData.email) data.email = updateData.email;

    if (updateData.password) {
      data.password = await bcrypt.hash(updateData.password, this.SALT_ROUNDS);
    }

    if (Object.keys(data).length === 0) {
      throw new Error('No valid fields to update');
    }

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      };
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new Error('Email already exists');
      }
      if (error.code === 'P2025') {
        throw new Error('User not found');
      }
      throw error;
    }
  }
}
