import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {z} from 'zod';
import { prisma } from "../lib/prisma";

export async function getEventAttendees(app:FastifyInstance){
      app
      .withTypeProvider<ZodTypeProvider>()
      .get('/events/:eventId/attendees', {
            schema:{
                  summary:'Get event  attendee',
                  tags:['Atrendee'],
                  params: z.object({
                        eventId:z.string().uuid()
                  }),
                  querystring:z.object({
                        query:z.string().nullish(),
                        pageIndex:z.string().nullish().default('0').transform(Number),
                  }),
                  response:{
                        200:z.object({
                              attendees:z.array(
                                    z.object({
                                    id:z.number(),
                                    name:z.string(),
                                    email:z.string(),
                                    createdAt:z.date(),
                                    checkInAt:z.date().nullable()

                              }))
                        })
                  }
                  },
            
      }, async (request, reply) => {
            const {eventId} = request.params;
            const {pageIndex, query} = request.query;

            //Pega varios registros
            //Take =>  quantos registro pega por vez
            // Skip => quantos registros ele pula
            const attendees = await prisma.attendee.findMany({
                  select:{
                        id:true,
                        name:true,
                        email:true,
                        createdAt:true,
                        checkIn:{
                              select:{
                                    createdAt:true,
                              }
                        }
                  },
                  //Contains é similar ao ilike "%query%"
                  //O i na frente do like diz pra ele não ligar se o texto esta em caixa auta ou não (case-sensitive)
                  where: query?{
                        eventId,
                        name:{
                              contains:query
                        },
                  }: {
                        eventId
                  },
                  take:10,
                  skip:pageIndex*10,
                  orderBy:{
                        createdAt:'desc'
                  }
            })

            return reply.send({
                  attendees:attendees.map(attendee => {
                        return {
                              id:attendee.id,
                              name:attendee.name,
                              email:attendee.email,
                              createdAt:attendee.createdAt,
                              checkInAt:attendee.checkIn?.createdAt ??  null
                        }
                  })
            })
      })
}