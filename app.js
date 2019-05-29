const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const redis = require('redis')

let client = redis.createClient()
client.on('connect', () => {
    console.log("Connected to redis ! ...")
})

const port = 3000

const app = express()

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(methodOverride('_method'))

app.get('/', (req, res, next) => {
    res.render('searchusers')
})

app.post('/users/search', (req, res, next) => {
    let id = req.body.id

    client.hgetall(id, (err, obj) => {
        if (!obj) {
            res.render('searchusers', {
                error: 'User does not exist'
            })
        } else {
            obj.id = id // it will make the obj.id = user001 || user002 ...
            res.render('details', {
                user: obj
            })
        }
    })
})

app.get('/users/add', (req, res, next) => {
    res.render('adduser')
})

app.post('/users/add', (req, res, next) => {
    let id = req.body.id
    let firstName = req.body.first_name
    let lastName = req.body.last_name
    let email = req.body.email
    let phone = req.body.phone

    client.hmset(id, [
        'first_name', firstName,
        'last_name', lastName,
        'phone', phone,
        'email', email
    ], (err, reply) => {
        if (err) {
            console.log(err)
        }
        console.log(reply)
        res.redirect('/')
    })
})

app.delete('/user/delete/:id', (req, res, next) => {
    client.del(req.params.id)
    res.redirect('/')
})

app.listen(port, () => {
    console.log('Server started on port: ', port)
})