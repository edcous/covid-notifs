const express = require('express')
require('dotenv').config()
const app = express()
const port = 3000
const timer = ms => new Promise(res => setTimeout(res, ms))
const cron = require('node-cron');

const connection = require('./config/db.config.js')
const Stock = require('./models/stock.js')
const Notifications = require('./models/notification.js')
const accountSid = process.env.twillio_account; 
const authToken = process.env.twillio_auth; 

connection.once('open', () => console.log('DB Connected'))
connection.on('error', () => console.log('Error with DB'))

app.use(express.json()) //parse incoming request body in JSON format.

app.get('/notification/create/', function(req, res, next) {
    Stock.findOne({ _id: req.query.id }).exec(function(err, s) {
        res.render('form', { stock: s });
    });
});

app.get('/done', function(req,res, next) {
    res.render('done')
})

app.listen(port, () => {
    console.log('App listening at ' + process.env.url)
})

app.use('/api/notif', require('./api/notification/create'))

function sendNotifs(){
    Stock.find({isInStock: true}).sort({store: 1, testType: 1}).exec(function(err, s) {
        const client = require('twilio')(accountSid, authToken);
        s.forEach(function(u){
            Notifications.find({testID: u._id}).exec(function(err, n) {
                console.log(n)
                n.forEach(function(l){
                    Stock.findOne({_id: l.testID}).exec(function(err, b) {
                        console.log(b)
                        client.messages 
                        .create({ 
                        body: 'FindACovidTest.org Notification - ' + b.testType + ' is in stock at ' + b.store + '. More details here: ' + 'http://localhost:8080/#' + b._id,  
                        messagingServiceSid: 'MG094543300f7640dcb2cb4253d67fa259',      
                        to: '+1' + l.phoneNumber
                        }) 
                        .then(message => console.log(message.sid)) 
                        .done();     
                        Notifications.deleteOne({_id: l._id}, (err, result) => {
                            if (err) return console.log(err)
                        })
                    })
                })
            })
        })
    })
}

cron.schedule('* * * * *', () => {
    sendNotifs()
})

app.set('view engine', 'ejs')