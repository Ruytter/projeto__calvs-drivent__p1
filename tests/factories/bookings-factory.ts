import faker from "@faker-js/faker";
import { prisma } from "@/config";

//Sabe criar objetos - Booking do banco
export async function createBooking(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    }
  });
}

// export async function createRoomWithHotelId(hotelId: number) {
//   return prisma.room.create({
//     data: {
//       name: "1020",
//       capacity: 3,
//       hotelId: hotelId,
//     }
//   });
// }
