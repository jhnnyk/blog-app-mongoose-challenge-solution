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

    it('should return blog posts with the right fields', function () {
      let resBlogPost
      return chai.request(app)
        .get('/posts')
        .then(function (res) {
          res.should.have.status(200)
          res.should.be.json
          res.body.posts.should.be.a('array')
          res.body.posts.should.have.length.of.at.least(1)

          res.body.posts.forEach(function (post) {
            post.should.be.a('object')
            post.should.include.keys('id', 'title', 'content', 'author', 'created')
          })

          resBlogPost = res.body.posts[0]
          return BlogPost.findById(resBlogPost.id)
        })
        .then(function (post) {
          resBlogPost.id.should.equal(post.id)
          resBlogPost.title.should.equal(post.title)
          resBlogPost.content.should.equal(post.content)
        })
    })
  })

  describe('POST endpoint', function () {
    it('should add a new blog post', function () {
      const newBlogPost = generateBlogPostData()

      return chai.request(app)
        .post('/posts')
        .send(newBlogPost)
        .then(function (res) {
          res.should.have.status(201)
          res.should.be.json
          res.body.should.be.a('object')
          res.body.should.include.keys('id', 'title', 'content', 'author', 'created')
          res.body.title.should.equal(newBlogPost.title)
          res.body.id.should.not.be.null
          res.body.content.should.equal(newBlogPost.content)
          return BlogPost.findById(res.body.id)
        })
        .then(function (post) {
          post.title.should.equal(newBlogPost.title)
          post.content.should.equal(newBlogPost.content)
        })
    })
  })
})
