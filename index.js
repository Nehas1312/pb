require('dotenv').config()
const { request, response } = require("express");
const express = require("express");
const morgan = require('morgan');
const app = express();
app.use(express.json())
app.use(express.static('build'))
const Contacts =require("./models/persons")

morgan.token('type', (request,response) => 
{
    if(request.body) return JSON.stringify(request.body)
    else return null
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))

// let persons = [
//   {
//     id: 1,
//     name: "Arto Hellas",
//     number: "040-123456",
//   },
//   {
//     id: 2,
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//   },
//   {
//     id: 3,
//     name: "Dan Abraham",
//     number: "12-43-234345",
//   },
//   {
//     id: 4,
//     name: "Mary jane",
//     number: "39-23-6423122",
//   },
// ];

const generateId = () => {
  const maxId = Contacts.length > 0
    ? Math.max(...Contacts.map(n => n.id))
    : 0
  return maxId + 1
}


app.get("/api/persons", (request, response) => {

  Contacts.find({}).then(Contacts =>
    {
        response.json(Contacts)
    })
});

app.get("/info", (request, response) => {
  response.send(`<div>
                    <p>The Phonebook has ${Contacts.length} contacts</p>
                    <p> ${new Date()} </p>
                 </div>   
                 `);
});


app.get('/api/persons/:objectId', (request, response, next) => {
  Contacts.findById(request.params.objectId)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      next(error)
    })
})

app.post('/api/persons',(request,response) =>
{
    const body = request.body

    if(body.name === undefined)
    {return response.status(400).json({error : 'content missing'})}
    
    const person = new Contacts(
        {
            name : body.name,
            number : body.number,
        }
    )

    person.save().then(savedContacts =>
        {
            response.json(savedContacts)
        })
}) 

app.put('/api/persons/:objectId', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Contacts.findByIdAndUpdate(request.params.objectId, person, { new: true })
    .then(updatedContact=> {
      response.json(updatedContact)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:objectId',(request,response)=>{
//  const idToDelete =(request.params.objectId)
Contacts.findByIdAndRemove(request.params.objectId).then(result => {
  response.status(204).end()
})
.catch(error => next(error))

  console.log(Contacts)
  console.log(`Deleted sucessfully`)
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});