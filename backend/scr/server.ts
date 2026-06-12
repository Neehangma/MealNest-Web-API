import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { env } from "./config/constant";
import { HttpException } from "./exceptions/http-exception";
import userRouter from "./routes/user.route";
import { sendError } from "./utils/apihelper.utils";

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({ success: true, message: "MealNest Backend Running" });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ success: true, message: "API is healthy" });
});

app.use("/api/v1", userRouter);

app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new HttpException(404, "Route not found"));
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = error instanceof HttpException ? error.statusCode : 500;
  const message =
    error instanceof HttpException ? error.message : "Internal server error";

  return sendError(res, statusCode, message);
});

export default app;
