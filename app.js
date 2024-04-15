const express = require('express')
const app = express()

const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error : ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

//Converting DB Object to Response Object :

const convertDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  }
}

//Get Movies API :

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name FROM movie;`
  const moviesArray = await db.all(getMoviesQuery)
  response.send(
    moviesArray.map(eachMovie => convertDbObjectToResponseObject(eachMovie)),
  )
})

//Post Movie API :

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuery = `
    INSERT INTO movie(director_id, movie_name, lead_actor)
    VALUES(${directorId}, '${movieName}', '${leadActor}');`
  const dbResponse = await db.run(postMovieQuery)
  const movieId = dbResponse.lastID
  response.send('Movie Successfully Added')
})

//Get Movie API :

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
    SELECT * FROM movie
    WHERE movie_id = ${movieId};`
  const movie = await db.get(getMovieQuery)
  response.send(convertDbObjectToResponseObject(movie))
})

//Update Movie API :

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateMovieQuery = `
    UPDATE movie
    SET director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//Delete Movie API :
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//Get Directors API :

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
    SELECT * FROM director;`
  const directorsArray = await db.all(getDirectorsQuery)
  response.send(
    directorsArray.map(eachDirector =>
      convertDbObjectToResponseObject(eachDirector),
    ),
  )
})

//Get Director Movies API :
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMoviesQuery = `
    SELECT movie_name FROM movie
    WHERE director_id = ${directorId};`
  const moviesArray = await db.all(getDirectorMoviesQuery)
  response.send(
    moviesArray.map(eachMovie => convertDbObjectToResponseObject(eachMovie)),
  )
})
module.exports = app
