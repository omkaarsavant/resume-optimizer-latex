import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import * as trpcExpress from '@trpc/server/adapters/express';
import { requestLogger, errorHandler, corsMiddleware, rateLimitMiddleware } from "./middleware.js";
import { createRouter } from "./router.js";
import { getGeminiClient } from "./services/gemini.js";
import { validateLaTeXCode } from "./utils/latexValidator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createApp() {
    const app = express();

    // Middleware
    app.use(express.json({ limit: '1mb' }));
    app.use(requestLogger);
    app.use(corsMiddleware);

    // Direct /api/generate endpoint for the frontend's fetch calls
    app.post('/api/generate', rateLimitMiddleware, async (req, res, next) => {
        try {
            const { latex_code, conversation_history, retry, continue: shouldContinue, job_description, modification_prompt } = req.body;

            if (!latex_code) {
                return res.status(400).json({ status: 'error', error: 'LaTeX code is required' });
            }

            // Validate LaTeX code
            const validationResult = validateLaTeXCode(latex_code);
            if (!validationResult.isValid) {
                return res.json({
                    output: latex_code,
                    status: 'error',
                    error: validationResult.message,
                });
            }

            // We re-use the logic from the router but in a direct Express handler
            const geminiClient = await getGeminiClient();

            // Let's call the tRPC logic indirectly for consistency
            const router = createRouter();
            const caller = router.createCaller({});

            const result = await caller.latex.generate({
                latex_code,
                conversation_history: conversation_history || [],
                retry: !!retry,
                continue: !!shouldContinue,
                job_description: job_description || undefined,
                modification_prompt: modification_prompt || undefined,
            });

            res.json(result);
        } catch (error) {
            next(error);
        }
    });

    // tRPC setup
    app.use(
        '/api/trpc',
        trpcExpress.createExpressMiddleware({
            router: createRouter(),
            createContext: () => ({}),
        })
    );

    // Health check endpoint
    app.get('/api/health', (req, res) => {
        res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Serve static files and handle routing ONLY in production
    if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
        const staticPath = path.resolve(__dirname, "public");
        app.use(express.static(staticPath));

        // Handle client-side routing - serve index.html for all routes
        app.get("*", (req, res) => {
            res.sendFile(path.join(staticPath, "index.html"));
        });
    } else {
        // In development or Vercel API mode, provide a simple message for the root
        app.get("/", (req, res) => {
            res.json({
                message: "Backend API is running. Use the frontend on port 3000.",
                health: "/api/health",
                trpc: "/api/trpc"
            });
        });
    }

    // Error handling middleware
    app.use(errorHandler);

    return app;
}
