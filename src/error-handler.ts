import {FastifyInstance} from 'fastify'
import { BadRequest } from './routes/_errors/bad-request';
import { ZodError } from 'zod';

type FastifyErrorHandler = FastifyInstance['errorHandler'];

export const errorHandler:FastifyErrorHandler = (error, request, reply) => {

      //validando typo com zod
      if(error instanceof ZodError){
            return reply.status(400).send({
                  message:'Error during validation',
                  //Retorna um array dos campos que deram erro e o erro de cada um
                  errors: error.flatten().fieldErrors,
            })
      }

      //Se o erro ocasionado, for uma instancia de badRequest
      if(error instanceof BadRequest){
            return reply.status(400).send(error.message)
      }

      return reply.status(500).send({message:"Internal server error!"})

}