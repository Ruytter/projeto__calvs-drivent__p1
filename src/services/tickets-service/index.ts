import { getTypesOfTickets } from "@/repositories/tickets-repository";

async function getAllTypesOfTickets() {
  const tickets =await getTypesOfTickets();
  return tickets;
}

const ticketsService = {
  getAllTypesOfTickets,
 
};

export default ticketsService;
