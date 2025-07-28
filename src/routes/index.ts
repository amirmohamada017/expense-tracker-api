import { Router } from "express";
import authRoutes from "./auth.js";
import expenseRoutes from "./expenses.js";

const router = Router();

router.get("/health", (_, res) => {
    res.status(200).json({
        success: true,
        message: "API is running successfully",
        data: {
            timestamp: new Date().toISOString(),
            environment: process.env["NODE_ENV"] || "development",
            version: "1.0.0",
        },
    });
});

router.use("/auth", authRoutes);
router.use("/expenses", expenseRoutes);

router.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found",
        error: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`,
    });
});

export default router;
