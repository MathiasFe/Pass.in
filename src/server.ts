import fastify from "fastify";
import {serializerCompiler, validatorCompiler, ZodTypeProvider, jsonSchemaTransform} from 'fastify-type-provider-zod'
import { createEvent } from "./routes/create-event";
import { registerForEvent } from "./routes/register-for-event";
import { getAttendeeBadge } from "./routes/get-attendee-badge";
import { getEvent } from "./routes/get-events";
import { checkIn } from "./routes/check-in";
import { getEventAttendees } from "./routes/get-event-attendees";
import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUi from "@fastify/swagger-ui";
import { errorHandler } from "./error-handler";
import fastifyCors from '@fastify/cors'

const app = fastify();

//Configura quem pode acessar a api, o origin vc informa o dominio do front-end quando for colocar em produção
app.register(fastifyCors,{
      origin:'*'
})

app.register(fastifySwagger,{
      swagger:{
            //informa que todos os dados que forem enviados a minha api deve ser em json
            consumes:['application/json'],
            //Informa qual o formato da resposta
            produces:['application/json'],
            info:{
                  title:'Pass.in',
                  description:'Especificações da API para o back-end da aplicação pass.in construida durante a nl da rockeseat',
                  version:'1.0.0',
            },
      },
      //Isso faz o swagger saber que estou usando o ZOD para validar esses dados
      transform:jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
      //informa que quando o cliente acessar esse link /docs, ele abre o swagger
      routePrefix:'/docs'
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createEvent);
app.register(registerForEvent);
app.register(getEvent);
app.register(getAttendeeBadge);
app.register(checkIn);
app.register(getEventAttendees);

//Seta para todos os erros cairem no errorHandler
app.setErrorHandler(errorHandler)

//O Host é definido para solucionar um pequeno bug que ocorre ao consumir a api com react-native
app.listen({port:3333, host:'0.0.0.0'}).then(() => {
      console.log('HTTP server runing')
});

