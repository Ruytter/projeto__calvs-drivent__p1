import { prisma } from "@/config";

async function findUserBooking(userId: number) {
  return prisma.booking.findFirst({
    where: { userId },
  });
}

async function findRoomsById(id: number) {
  return prisma.room.findFirst({
    where: { id },
  });
}

async function findBookingByRoomId(roomId: number) {
  return prisma.booking.findMany({
    where: {
      roomId,
    },
  });
}

async function findBookingById(id: number) {
  return prisma.booking.findFirst({
    where: { id },
  });
}

async function createBookingByRoomId(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

async function changeBookingByRoomIds(userId: number, id: number, newRoomId: number) {
  prisma.booking.delete({
    where: {
      id,
    },
  });
  return createBookingByRoomId(userId, newRoomId);
}

const bookingRepository = {
  findUserBooking,
  findBookingById,
  findRoomsById,
  findBookingByRoomId,
  createBookingByRoomId,
  changeBookingByRoomIds,
};

export default bookingRepository;
