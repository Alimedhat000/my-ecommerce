import { Router } from "express";
import authRoutes from "./authRoutes";
import postRoutes from "./postRoutes";

const router = Router();

// Each sub-route is mounted under /api/* in app.ts
router.use("/auth", authRoutes);
router.use("/posts", postRoutes);

export default router;
