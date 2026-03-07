import { createApp } from "./app";

async function startServer() {
  const app = await createApp();
  const port = process.env.PORT || 3001;

  app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
    console.log(`Health check: http://localhost:${port}/api/health`);
    console.log(`API endpoints: http://localhost:${port}/api/trpc`);
  });
}

startServer().catch(console.error);