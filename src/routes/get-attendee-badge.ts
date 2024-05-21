import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {z} from "zod";
import { prisma } from "../lib/prisma";
import { BadRequest } from "./_errors/bad-request";

export async function getAttendeeBadge(app:FastifyInstance){
      app
      .withTypeProvider<ZodTypeProvider>()
      .get('/attendees/:attendeeId/badge',{
            schema:{
                  summary:'Get attendee badge',
                  tags:['Atrendee'],
                  params:z.object({
                        attendeeId:z.coerce.number().int() //o Coerce converte um valor em string para number
                  }),
                  response:{
                        200:z.object({
                              badge:z.object({
                                    name:z.string(),
                                    email:z.string().email(),
                                    eventTitle:z.string(),
                                    checkInUrl:z.string().url()
                              })
                        })
                  }
            }
      },async (request, reply)=>{
            const {attendeeId} = request.params;

            const attendee = await prisma.attendee.findUnique({
                  select:{
                        name:true,
                        email:true,
                        event:{
                              select:{
                                    title:true,
                              }
                        }
                  },
                  where:{
                        id:attendeeId,
                  }
            })

            if(attendee === null){
                  throw new BadRequest('Nenhum participante encontrador')
            }

            const baseUrl = `${request.protocol}//${request.hostname}`;

            //Isso é uma classe, para converter em url usa o .toString();
            const checkInUrl = new URL(`/attendees/${attendeeId}/check-in`, baseUrl)

           return reply.send({
            badge:{
                  name:attendee.name,
                  email:attendee.email,
                  eventTitle:attendee.event.title,
                  checkInUrl:checkInUrl.toString()
            }
           })

      })

}