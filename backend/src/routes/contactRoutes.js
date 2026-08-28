import { Router } from "express";
import {
  getContacts,
  getContactById,
  addContact,
  updateContact,
  deleteContact,
} from "../controllers/contactController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getContacts);
router.post("/", addContact);
router.get("/:id", getContactById);
router.put("/:id", updateContact);
router.delete("/:id", deleteContact);

export default router;
