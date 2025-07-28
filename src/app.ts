import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import routes from "./routes/index.js";

dotenv.config();

const app = express();

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
        },
    })
);

const corsOptions = {
    origin: process.env["CORS_ORIGIN"] || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
};

app.use(cors(corsOptions));

const limiter = rateLimit({
    windowMs: parseInt(process.env["RATE_LIMIT_WINDOW_MS"] || "900000", 10),
    max: parseInt(process.env["RATE_LIMIT_MAX_REQUESTS"] || "100", 10),
    message: {
        success: false,
        message: "Too many requests from this IP, please try again later.",
        error: "Rate limit exceeded",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api", limiter);

app.use(compression());

if (process.env["NODE_ENV"] === "production") {
    app.use(morgan("combined"));
} else {
    app.use(morgan("dev"));
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", routes);

app.get("/", (_, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Expense Tracker API",
        data: {
            version: "1.0.0",
            documentation: "/api/health",
            endpoints: {
                auth: "/api/auth",
                expenses: "/api/expenses",
            },
        },
    });
});

app.use((err: any, _: express.Request, res: express.Response, __: express.NextFunction) => {
    console.error("Global error handler:", err);

    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON format in request body",
            error: "Malformed JSON",
        });
    }

    if (err.type === "entity.too.large") {
        return res.status(413).json({
            success: false,
            message: "Request entity too large",
            error: "Payload too large",
        });
    }

    return res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
        error: process.env["NODE_ENV"] === "production" ? "Something went wrong" : err.stack,
    });
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
});

export default app;
