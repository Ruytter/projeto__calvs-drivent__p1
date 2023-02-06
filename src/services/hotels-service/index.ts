import { notFoundError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";

async function getHotels() {
  const hotels = await hotelRepository.findHotels();
  if (!hotels) {
    throw notFoundError();
  }
  return hotels;
}

async function getPaidTicket(id: number) {
  const paidTicket = await hotelRepository.findPaidTicket(id);
  if (!paidTicket) {
    throw notFoundError();
  }
  return paidTicket;
}

async function getRoomsByHotelId(hotelId: number) {
  const hotels = await hotelRepository.findRoomsByHotelId(hotelId);
  if (!hotels) {
    throw notFoundError();
  }
  return hotels;
}

const hotelsService = {
  getHotels,
  getRoomsByHotelId,
  getPaidTicket,
};

export default hotelsService;
