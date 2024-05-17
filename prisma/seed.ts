import {prisma} from '../src/lib/prisma'

//serve para criar ums dados fake para quem baixar o projeot não ficar com o banco vazio
//Não esqueça de configurar o packege.json para usar essa seed
//para rodar a seed basta dar um npx prisma db seed
async function seed(){
      await prisma.event.create({
            data:{
                  id:'96bdays9-9dsa-4ds8-b335-76356254425',
                  title:'Evento de Teste',
                  slug:'evento-teste',
                  details:'Evento criado apenas como teste pelo seed configurado',
                  maximumAttendees:10
            }
      })
}


seed().then(() => {
      console.log("Database seeded!")
      prisma.$disconnect()
})