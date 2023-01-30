import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getAllTypesOfTickets } from "@/controllers";

const ticketsRouter = Router();

ticketsRouter

  .all("/*", authenticateToken)
  .get("/tickets/types", getAllTypesOfTickets); //Retorna todos os tipos de ticket
  
export { ticketsRouter };
