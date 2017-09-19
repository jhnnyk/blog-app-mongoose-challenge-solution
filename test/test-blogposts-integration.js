const chai = require('chai')
const chaiHttp = require('chai-http')
const faker = require('faker')
const mongoose = require('mongoose')

const should = chai.should()

const {BlogPost} = require('../models')
const {app, runServer, closeServer} = require('../server')
const {TEST_DATABASE_URL} = require('../config')

chai.use(chaiHttp)

// add test data to the test database
function seedBlogPostData () {
  console.info('seeding blog post data...')
  const seedData = []

  for (let i = 1; i <= 10; i++) {
    seedData.push(generateBlogPostData())
  }

  return BlogPost.insertMany(seedData)
}

function generateBlogPostData () {
  return {
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    },
    title: faker.lorem.words(),
    content: faker.lorem.paragraphs(),
    created: faker.date.past()
  }
}

function tearDownDb () {
  console.warn('deleting database...')
  return mongoose.connection.dropDatabase()
}

describe('BlogPost API resource', function () {
  // before running the tests, connect to the test database and start the server
  before(function () {
    return runServer(TEST_DATABASE_URL)
  })

  // before each test, seed the test database
  beforeEach(function () {
    return seedBlogPostData()
  })

  // after each test, destroy the test database
  afterEach(function () {
    return tearDownDb()
  })

  // after running the tests, stop the server
  after(function () {
    return closeServer()
  })

  describe('GET endpoint', function () {
    it('should return all existing blog posts', function () {
      let res
      return chai.request(app)
        .get('/posts')
        .then(function (_res) {
          res = _res
          res.should.have.status(200)
          res.body.posts.should.have.length.of.at.least(1)
          return BlogPost.count()
        })
        .then(function (count) {
          console.log(count)
          res.body.posts.should.have.lengthOf(count)
        })
    })
  })
})
