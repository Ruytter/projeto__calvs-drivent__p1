import { prisma } from "@/config";
 
export async function getTypesOfTickets() {
  return await prisma.ticketType.findMany();
}

const ticketsRepository = {
  getTypesOfTickets,
};

export default ticketsRepository;
