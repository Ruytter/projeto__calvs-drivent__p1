import { prisma } from "@/config";

async function findHotels() {
  return prisma.hotel.findMany();
}

async function findPaidTicket(id: number) {
  return await prisma.ticket.findUnique({ where: { id } });
}

async function findRoomsByHotelId(id: number) {
  const data = prisma.hotel.findFirst({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      Rooms: {
        select: {
          id: true,
          name: true,
          capacity: true,
          hotelId: true,
          createdAt: true,
          updatedAt: true,
        }
      }
    }
  });
  return data;
}

const hotelRepository = {
  findHotels,
  findRoomsByHotelId,
  findPaidTicket,
};

export default hotelRepository;
