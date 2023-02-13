import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/bookings-service";
import httpStatus from "http-status";

export async function getUserBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const userBooking = await bookingService.getUserBooking(Number(userId));
    return res.status(httpStatus.OK).send(userBooking);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function postCreateUserBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const roomId = req.body.roomId as number;
  try {
    const id = await bookingService.createUserBooking(userId, roomId);
    return res.status(httpStatus.OK).send({ id });
  } catch (error) {
    if (error.message === "PaymentError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    if (error.name === "ForbiddenError") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function updateUserBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { bookingId } = req.params;
  const newRoomId = req.body.roomId as number;
  try {
    const newBookingId = await bookingService.updateRooms(Number(userId), Number(bookingId), Number(newRoomId));
    if (newBookingId !== null) {
      const bookingId = newBookingId;
      return res.status(httpStatus.OK).send({ bookingId });
    }
  } catch (error) {
    if (error.name === "ForbiddenError") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
