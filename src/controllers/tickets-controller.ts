import { AuthenticatedRequest } from "@/middlewares";
import ticketsService from "@/services/tickets-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getAllTypesOfTickets(req: AuthenticatedRequest, res: Response) {
  try {
    const tickets = await ticketsService.getAllTypesOfTickets();
    return res.status(httpStatus.OK).send(tickets);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.send(httpStatus.NO_CONTENT);
    }
  }
}
