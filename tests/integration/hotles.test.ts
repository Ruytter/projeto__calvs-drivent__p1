import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicketType,
  createTicket,
  createPayment,
  createRoom,
  createHotel,
  generateCreditCardData,
} from "../factories";
import { generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should response status 200 if ticket OK", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    await createPayment(ticket.id, ticketType.price);
    const body = { ticketId: ticket.id, cardData: generateCreditCardData() };
    await server.post("/payments/process").set("Authorization", `Bearer ${token}`).send(body);
    const updatedTicket = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    for (let i = 1; i < 5; i++) {
      await createHotel();
    }
    const hotels = await prisma.hotel.findMany();
    for (let i = 0; i < hotels.length - 1; i++) {
      for (let j = 0; j < 5; j++) {
        await createRoom(hotels[i].id);
      }
    }

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(updatedTicket.status).toEqual(TicketStatus.PAID);
    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
        }),
      ]),
    );
  });
});

describe("GET /hotels/:hotelsId", () => {
  it("should response status 200 if ticket OK", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
    await createPayment(ticket.id, ticketType.price);
    const body = { ticketId: ticket.id, cardData: generateCreditCardData() };
    await server.post("/payments/process").set("Authorization", `Bearer ${token}`).send(body);
    const updatedTicket = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    const hotels = await prisma.hotel.findMany();

    const response = await server.get(`/hotels/${hotels[2].id}`).set("Authorization", `Bearer ${token}`);
    expect(updatedTicket.status).toEqual(TicketStatus.PAID);
    expect(response.status).toBe(httpStatus.OK);
  });
});
