import express from "express";
import { sendChatMessage } from "../controller/chatbotController";

const { authenticate } = require("../middleware/authorized.middleware");

const router = express.Router();

router.post("/", authenticate, sendChatMessage);

export default router;
