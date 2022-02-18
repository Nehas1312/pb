const { request, response } = require("express");
const express = require("express");
const morgan = require('morgan');
const app = express();
app.use(express.json())
app.use(express.static('build'))

morgan.token('type', (request,response) => 
{
    if(request.body) return JSON.stringify(request.body)
    else return null
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}


app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/info", (request, response) => {
  response.send(`<div>
                    <p>The Phonebook has ${persons.length} contacts</p>
                    <p> ${new Date()} </p>
                 </div>   
                 `);
});


app.get('/api/persons/:id',(request,response)=>{
  const id = Number(request.params.id)
  const person = persons.find(person => person.id == id )
  
  if (person){
    response.json(person)
  }
  else{
    response.status(404).end()
  } 
})

app.post('/api/persons',(request,response)=>{
  const body = request.body
  console.log(request.body)
  
  if (persons.findIndex((person) => person.name === body.name) !== -1) {
    return response.status(404).json({
      error : 'name must be unique'
    })
  }
  
   else if (!body.name || !body.number){
    return  response.status(404).json({
    error :'name or number is missing'
  })
  }

  const person = {
    name : body.name,
    number:body.number,
    date: new Date(),
    id:generateId(),
  }
  
  persons = persons.concat(person)

  morgan.token()
  response.json(person)
})

app.delete('/api/persons/:id',(request,response)=>{
  const id = Number(request.params.id)
  const person = persons.filter(person => person.id !== id)
  response.status(204).end()
  console.log(`Deleted sucessfully`)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});