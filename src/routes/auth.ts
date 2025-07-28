import { Router } from "express";
import { AuthController } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validation.js";
import { registerSchema, loginSchema } from "../middleware/validation.js";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", validateRequest(registerSchema), AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post("/login", validateRequest(loginSchema), AuthController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", authenticateToken, AuthController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put("/profile", authenticateToken, AuthController.updateProfile);

export default router;
