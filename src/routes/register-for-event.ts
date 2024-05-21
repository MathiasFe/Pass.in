import {FastifyInstance} from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { request } from "http"
import z from "zod"
import { prisma } from "../lib/prisma"
import { BadRequest } from "./_errors/bad-request"

export async function registerForEvent(app:FastifyInstance){
      app
      .withTypeProvider<ZodTypeProvider>()
      .post('/event/:eventId/attendees', {
            schema:{
                  summary:'Register an attendee',
                  tags:['Atrendee'],
                  body:z.object({
                        name:z.string().min(4),
                        email:z.string().email()
                  }),
                  params:z.object({
                        eventId:z.string().uuid(),
                  }),
                  response:{
                    201:z.object({
                        attendeeId: z.number(),
                    })    
                  }
            }
      },async (request, reply)=>{
            const {eventId} = request.params;
            const {name, email} = request.body;

            const attendeeFromEmail = await prisma.attendee.findUnique({
                  where:{
                        eventId_email:{ //Como colocamos a validação unica dentro do banco , podemos usa-la para tentar encontrar algum registro que atenda os 2
                              email,
                              eventId
                        }
                  }
            })
             
            if(attendeeFromEmail !== null)
                  throw new Error('Esse e-mail já foi registrado no evento')

        const [event,amoutOfAttendeeForEvent ] = await Promise.all([
                  await prisma.event.findUnique({
                        where:{
                              id: eventId,
                        }
                  }),
                  await prisma.attendee.count({
                        where:{
                              eventId
                        }
                  })
            ])

            if(event?.maximumAttendees && amoutOfAttendeeForEvent > event?.maximumAttendees){
                  throw new BadRequest('Desculpe, mas já foi alcançado o numero maximo de participantes para esse evento');
            }


            const attendee = await prisma.attendee.create({
                  data:{
                        name,
                        email,
                        eventId
                  }
            })
            return reply.status(201).send({attendeeId: attendee.id})
      })
}