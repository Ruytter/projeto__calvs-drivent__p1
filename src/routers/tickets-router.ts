import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getAllTypesOfTickets } from "@/controllers";
// import { createEnrollmentSchema } from "@/schemas";

const ticketsRouter = Router();

ticketsRouter

  .all("/*", authenticateToken)
  .get("/tickets/types", getAllTypesOfTickets) //Retorna todos os tipos de ticket
  // .get("/tickets", getEnrollmentByUser) //Retorna o ticket do usuário
  // .post("/tickets", validateBody(createEnrollmentSchema), postCreateOrUpdateEnrollment) //Cria um novo ticket para o usuário baseado no tipo de ticket
  // .get("/payments?ticketId=1", getEnrollmentByUser) //Retorna a informação de pagamento do ticket do usuário
  // .post("/tickets", validateBody(createEnrollmentSchema), postCreateOrUpdateEnrollment); //Cria um novo pagamento para o ticket

export { ticketsRouter };
