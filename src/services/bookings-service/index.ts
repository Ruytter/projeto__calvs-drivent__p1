import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import bookingRepository from "@/repositories/booking-repository";
import { notFoundError, conflictError, forbiddenError } from "@/errors";

async function getUserBooking(userId: number) {
  const userBooking = await bookingRepository.findUserBooking(userId);
  if (!userBooking) {
    throw notFoundError();
  }
  return userBooking;
}

async function createUserBooking(userId: number, roomId: number) {
  //Tem ticket pago presencial e com hospedagem
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw conflictError("PaymentError");
  }
  const room = await bookingRepository.findRoomsById(roomId);
  if (!room) {
    throw notFoundError();
  }
  const bookingExist = await bookingRepository.findBookingByRoomId(roomId);
  if (bookingExist.length >= room.capacity) {
    throw forbiddenError();
  }
  const booking = await bookingRepository.createBookingByRoomId(userId, roomId);
  return booking.id;
}

async function updateRooms(userId: number, bookingId: number, newRoomId: number) {
  const bookingExist = await bookingRepository.findBookingById(bookingId);
  if (!bookingExist || bookingExist.userId !== userId) {
    throw forbiddenError();
  }
  const newRoom = await bookingRepository.findRoomsById(newRoomId);
  if (!newRoom) {
    throw notFoundError();
  }
  const newBookingExist = await bookingRepository.findBookingByRoomId(newRoomId);
  if (newBookingExist.length >= newRoom.capacity) {
    throw forbiddenError();
  }
  const newBooking = await bookingRepository.changeBookingByRoomIds(userId, bookingExist.id, newRoomId);
  return newBooking.id;
}
const bookingService = {
  getUserBooking,
  createUserBooking,
  updateRooms,
};

export default bookingService;
