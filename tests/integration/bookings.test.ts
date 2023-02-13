import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicket,
  createPayment,
  createTicketTypeWithHotel,
  createTicketTypeRemote,
  createHotel,
  createRoomWithHotelId,
  createBooking,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 if a booking does not exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const createdHotel = await createHotel();
      await createRoomWithHotelId(createdHotel.id);
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
      expect(response.body).toEqual({});
    });

    it("should respond with status 200 and the booking data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      const booking = await createBooking(user.id, createdRoom.id);
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);

      expect(response.body).toEqual(
        {
          id: booking.id,
          userId: booking.userId,
          roomId: booking.roomId,
          createdAt: booking.createdAt.toISOString(),
          updatedAt: booking.updatedAt.toISOString()
        }
      );
    });

    it("should respond with status 200 and an empty array", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual([]);
    });
  });
});

describe("POST: /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 402 when user ticket is remote ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 404 if roomId does not exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      await createHotel();
      const body = { roomId: 0, };
      
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 if room has no vacancy", async () => {
      const user = await createUser();
      const user2 = await createUser();
      const user3 = await createUser();
      const user4 = await createUser();
      const token = await generateValidToken(user);
      const token2 = await generateValidToken(user2);
      const token3 = await generateValidToken(user2);
      const token4 = await generateValidToken(user2);
      const enrollment = await createEnrollmentWithAddress(user);
      const enrollment2 = await createEnrollmentWithAddress(user2);
      const enrollment3 = await createEnrollmentWithAddress(user3);
      const enrollment4 = await createEnrollmentWithAddress(user4);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      const booking2 = await createBooking(user2.id, createdRoom.id);
      const booking3 = await createBooking(user3.id, createdRoom.id);
      const booking4 = await createBooking(user4.id, createdRoom.id);
      const newBooking = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: createdRoom.id });
      
      expect(newBooking.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200 and the bookingId", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      await createBooking(user.id, createdRoom.id);
      await createBooking(user.id, createdRoom.id);
      const body = { roomId: createdRoom.id, };
      
      const booking = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      expect(booking.status).toBe(httpStatus.OK);
      expect(booking.body).toEqual(
        {
          id: booking.body.id,
        }
      );
    });
  });
});

describe("PUT: /booking/bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.put("/booking/2");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put("/booking/3").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 if roomId no exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      const createdNewRoom = await createRoomWithHotelId(createdHotel.id);
      const booking = await createBooking(user.id, createdRoom.id);
      await createBooking(user.id, createdNewRoom.id);
      const newBooking = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({ roomId: createdNewRoom.id+10 });
      expect(newBooking.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 if user has no booking", async () => {
      const user = await createUser();
      const user2 = await createUser();
      const user3 = await createUser();
      const user4 = await createUser();
      const token = await generateValidToken(user);
      const token2 = await generateValidToken(user2);
      const token3 = await generateValidToken(user2);
      const token4 = await generateValidToken(user2);
      const enrollment = await createEnrollmentWithAddress(user);
      const enrollment2 = await createEnrollmentWithAddress(user2);
      const enrollment3 = await createEnrollmentWithAddress(user3);
      const enrollment4 = await createEnrollmentWithAddress(user4);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      const createdNewRoom = await createRoomWithHotelId(createdHotel.id);
      const booking = await createBooking(user.id, createdRoom.id);
      const booking2 = await createBooking(user2.id, createdNewRoom.id);
      const booking3 = await createBooking(user3.id, createdNewRoom.id);
      const booking4 = await createBooking(user4.id, createdNewRoom.id);
      const newBooking = await server.put("/booking/0").set("Authorization", `Bearer ${token}`).send({ roomId: createdNewRoom.id });
      expect(newBooking.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if room has no vacancy", async () => {
      const user = await createUser();
      const user2 = await createUser();
      const user3 = await createUser();
      const user4 = await createUser();
      const token = await generateValidToken(user);
      const token2 = await generateValidToken(user2);
      const token3 = await generateValidToken(user2);
      const token4 = await generateValidToken(user2);
      const enrollment = await createEnrollmentWithAddress(user);
      const enrollment2 = await createEnrollmentWithAddress(user2);
      const enrollment3 = await createEnrollmentWithAddress(user3);
      const enrollment4 = await createEnrollmentWithAddress(user4);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      const createdNewRoom = await createRoomWithHotelId(createdHotel.id);
      const booking = await createBooking(user.id, createdRoom.id);
      const booking2 = await createBooking(user2.id, createdNewRoom.id);
      const booking3 = await createBooking(user3.id, createdNewRoom.id);
      const booking4 = await createBooking(user4.id, createdNewRoom.id);
      const newBooking = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({ roomId: createdNewRoom.id });
      expect(newBooking.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200 and the bookingId", async () => {
      const user = await createUser();
      const user2 = await createUser();
      const user3 = await createUser();
      const user4 = await createUser();
      const token = await generateValidToken(user);
      const token2 = await generateValidToken(user2);
      const token3 = await generateValidToken(user2);
      const token4 = await generateValidToken(user2);
      const enrollment = await createEnrollmentWithAddress(user);
      const enrollment2 = await createEnrollmentWithAddress(user2);
      const enrollment3 = await createEnrollmentWithAddress(user3);
      const enrollment4 = await createEnrollmentWithAddress(user4);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      const createdNewRoom = await createRoomWithHotelId(createdHotel.id);
      const booking = await createBooking(user.id, createdRoom.id);
      const booking2 = await createBooking(user2.id, createdNewRoom.id);
      const booking3 = await createBooking(user3.id, createdNewRoom.id);
      const booking4 = await createBooking(user4.id, createdRoom.id);
      const newBooking = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({ roomId: createdNewRoom.id });
      expect(newBooking.status).toBe(httpStatus.OK);
      expect(newBooking.body).toEqual(
        {
          bookingId: newBooking.body.bookingId,
        }
      );
    });
  });
});
