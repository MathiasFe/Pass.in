import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import {prisma} from "../lib/prisma"
import { generateSlug } from "../utils/generate-slug";
import { FastifyInstance } from "fastify";
import { BadRequest } from "./_errors/bad-request";

//usamos uma função que vai receber o app do fastify, pois não podemos instanciar uma novo app aqui
// o fastify por padrão, todas as funções que separam nossa aplicação como rotas, precisam ser asyncronas, se não ele roda em um looping infinito
export async function createEvent(app:FastifyInstance){
      app
      .withTypeProvider<ZodTypeProvider>()
      .post('/events',{
            schema:{
                  summary:'Create an event',
                  tags:['events'],
                  body:z.object({
                        title:z.string().min(4), //Tem no minimo 4 caracteres
                        details:z.string().nullable(), //Pode ser nulo
                        maximumAttendees:z.number().int().positive().nullable() // Tem que ser um inteiro positivo, mas pode ser nulo
                  }),
                  response:{
                        201: z.object({
                              eventId:z.string().uuid(),
                        })
                  }
      }}, async (request, reply)=>{
            //Creando validação com zod
      
            const data = request.body // valida os dados vindo do body, para ver se atende o schema passado pelo zod, além de ja deixar tipado a variavel data
      
            let slug = generateSlug(data.title);
      
            //verificando se o slug já existe
            //buscando por um unico registo que bata com a validação
            const eventWithSameSlug = await prisma.event.findUnique({
                  where:{
                        slug,
                  }
            })
      
            if(eventWithSameSlug !== null)
                  throw new BadRequest('O evento que está tentando adicionar já existe!')
      
          const event =  await prisma.event.create({ //Gravando no banco de dados
                  data:{
                        title:data.title,
                        details:data.details,
                        maximumAttendees:data.maximumAttendees,
                        slug:slug,
                  }
            })
      
            return reply.status(201).send({eventId:event.id}); // o 201 retorna que um dado foi registrado
      
      })
}

