import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getUserBooking, postCreateUserBooking, updateUserBooking } from "@/controllers";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/", getUserBooking)
  .post("/", postCreateUserBooking)
  .put("/:bookingId", updateUserBooking);

export { bookingRouter };
