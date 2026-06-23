import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import { env } from "./config/constant";
import { HttpException } from "./exceptions/http-exception";
import authRouter from "./routes/auth.route";
import { sendError } from "./utils/apihelper.utils";

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_req: Request, res: Response) => {
  res.json({ success: true, message: "MealNest Backend Running" });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ success: true, message: "API is healthy" });
});

app.use("/api/v1", authRouter);

app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new HttpException(404, "Route not found"));
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = error instanceof HttpException ? error.statusCode : 500;
  const message =
    error instanceof HttpException || env.nodeEnv === "development"
      ? error.message
      : "Internal server error";

  if (env.nodeEnv === "development") {
    console.error(error);
  }

  return sendError(res, statusCode, message);
});

export default app;
