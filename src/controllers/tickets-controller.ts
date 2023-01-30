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

export async function getTicketByUser(req: AuthenticatedRequest, res: Response) {
  try {
    const ticket = await ticketsService.getTicket();
    return res.status(httpStatus.OK).send(ticket);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.send(httpStatus.NO_CONTENT);
    }
  }
}

export async function postCreateTicket(req: AuthenticatedRequest, res: Response) {
  try {
    await ticketsService.CreateTicket({
      ...req.body,
      userId: req.userId,
    });
    return res.sendStatus(httpStatus.OK);
  } catch (error) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function postCreateTicketPayment(req: AuthenticatedRequest, res: Response) {
  try {
    await ticketsService.createPayment({
      ...req.body,
      userId: req.userId,
    });
    return res.sendStatus(httpStatus.OK);
  } catch (error) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function getPaymentByTicketId(req: AuthenticatedRequest, res: Response) {
  try {
    const ticket = await ticketsService.getPayment();
    return res.status(httpStatus.OK).send(ticket);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.send(httpStatus.NO_CONTENT);
    }
  }
}  
