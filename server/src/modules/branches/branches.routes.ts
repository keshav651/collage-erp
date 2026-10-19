
import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";
import {
  createBranchController,
  getAllBranchesController,
} from "./branches.controller.js";

const router = Router();

// Only authenticated admins can manage branches
router.use(authenticateToken);
router.use(allowRoles("ADMIN"));

// Create a branch
router.post("/", createBranchController);

// Get all branches
router.get("/", getAllBranchesController);

export default router;
