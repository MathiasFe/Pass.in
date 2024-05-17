import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {z} from 'zod';
import { prisma } from "../lib/prisma";

export async function getEvent(app:FastifyInstance){
      app
      .withTypeProvider<ZodTypeProvider>()
      .get('/events/:eventId', {
            schema:{
                  summary:'Get an event',
                  tags:['events'],
                  params: z.object({
                        eventId:z.string().uuid()
                  }),
                  response:{
                        200: z.object({
                             event:z.object({
                                    id:z.string().uuid(),
                                    title:z.string(),
                                    slug:z.string(),
                                    details:z.string().nullable(),
                                    maximumAttendees:z.number().int().nullable(),
                                    attendeesAmount:z.number().int()
                             })
                        })
                  },
            }
      }, async (request, reply) => {
            const {eventId} = request.params;

            const event =  await prisma.event.findUnique({
                  select:{
                        id:true,
                        slug:true,
                        title:true,
                        maximumAttendees:true,
                        details:true,
                        _count:{
                              select:{
                                    attendees:true //Esse cara é criado, apartir do relacionamento entre o evento e attendee que foi criado no banco de dados
                              }
                        }
                  },
                  where:{
                        id:eventId
                  }
            })

            if(event === null)
                  throw new Error("Evento não encontrador.")

            return reply.send({
                  event:{
                        id:event.id,
                        title:event.title,
                        slug:event.slug,
                        details:event.details,
                        maximumAttendees:event.maximumAttendees,
                        attendeesAmount:event._count.attendees
                  }
            })

      })
}