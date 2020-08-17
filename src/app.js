const express = require("express");
const cors = require("cors");

 const { uuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

app.get("/repositories", (request, response) => {
  response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs} = request.body

  const project = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  }

  repositories.push(project);

  response.status(201).json(project);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs} = request.body;

  const projecIndex = repositories.findIndex(project => project.id === id);

  if(projecIndex < 0 ){
    return response.status(400).json({error: "Project not found"})
  }

  repositories[projecIndex] = {
    id,
    title,
    url,
    techs,
    likes: repositories[projecIndex].likes
  }

  response.status(201).json(repositories[projecIndex])


});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const projecIndex = repositories.findIndex(project => project.id === id);

  if(projecIndex < 0 ){
    return response.status(400).json({error: "Project not found"})
  }

  repositories.splice(projecIndex);

  response.status(204).json();

});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const projecIndex = repositories.findIndex(project => project.id === id);

  if(projecIndex < 0 ){
    return response.status(400).json({error: "Project not found"})
  }

  repositories[projecIndex] = {
    id,
    title: repositories[projecIndex].title,
    url: repositories[projecIndex].url,
    techs: repositories[projecIndex].techs,
    likes: repositories[projecIndex].likes + 1
  }

  response.status(201).json({likes: repositories[projecIndex].likes})


});

module.exports = app;
