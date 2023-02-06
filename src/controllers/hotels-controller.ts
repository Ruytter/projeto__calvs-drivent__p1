import { AuthenticatedRequest } from "@/middlewares";
import hotelService from "@/services/hotels-service";
import ticketService from "@/services/tickets-service";
import { TicketStatus } from "@prisma/client";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const ticket = await ticketService.getTicketByUserId(userId);
    if (!ticket) {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    const paydTicket = await hotelService.getPaidTicket(Number(ticket.id));

    if (paydTicket.status !== TicketStatus.PAID) {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    
    const hotels = await hotelService.getHotels();

    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function getRoomsByHotelId(req: AuthenticatedRequest, res: Response) {
  try {
    const { hotelId } = req.params;
    const { userId } = req;
    const ticket = await ticketService.getTicketByUserId(userId);
    if (!ticket) {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    const paydTicket = await hotelService.getPaidTicket(Number(ticket.id));

    if (paydTicket.status !== TicketStatus.PAID) {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }

    const rooms = await hotelService.getRoomsByHotelId(Number(hotelId));

    return res.status(httpStatus.OK).send(rooms);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}
