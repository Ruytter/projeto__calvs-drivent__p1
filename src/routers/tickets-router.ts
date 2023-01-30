import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getAllTypesOfTickets, getTicketByUser, postCreateTicket, getPaymentByTicketId, postCreateTicketPayment } from "@/controllers";
import { createTicketchema, createPaymenteSchema } from "@/schemas";

const ticketsRouter = Router();

ticketsRouter

  .all("/*", authenticateToken)
  .get("/tickets/types", getAllTypesOfTickets) //Retorna todos os tipos de ticket
  .get("/tickets", getTicketByUser) //Retorna o ticket do usuário
  .post("/tickets", validateBody(createTicketchema), postCreateTicket) //Cria um novo ticket para o usuário baseado no tipo de ticket
  .get("/payments?ticketId=1", getPaymentByTicketId) //Retorna a informação de pagamento do ticket do usuário
  .post("/payments/process", validateBody(createPaymenteSchema), postCreateTicketPayment); //Cria um novo pagamento para o ticket

export { ticketsRouter };
