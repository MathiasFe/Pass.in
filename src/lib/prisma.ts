import { PrismaClient } from "@prisma/client";

//conexão com o banco de dados
export const prisma = new PrismaClient({
      log:['query'] //toda a ação feita para o banco de dados ele retorna um log pra ser visualizado
})
