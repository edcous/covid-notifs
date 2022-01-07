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
    res.render('done', { number: req.query.number })
})

app.listen(port, () => {
    console.log('App listening at ' + process.env.url)
})

app.use('/api/notif', require('./api/notification/create'))

function sendNotifs(){
    const client = require('twilio')(accountSid, authToken);
    Notifications.find({sent: false}).exec(function(err, n) {
        n.forEach(function(m){
            Stock.findOne({_id: m.testID}).exec(function(err, b) {
                if(b.isInStock){
                    Notifications.findOneAndUpdate({_id: m._id}, {sent:true}, {upsert: false}, function(err, doc) {});
                    console.log(b)
                    client.messages 
                    .create({ 
                    body: 'FindACovidTest.org Notification - ' + b.testType + ' is in stock at ' + b.store + '. More details here: ' + 'https://www.findacovidtest.org/?utm_source=sms#' + b._id + '.' + ' To continue to receive notifications click here: ' + 'https://notifications.findacovidtest.org/notification/create?id=' + b.id,  
                    messagingServiceSid: 'MG094543300f7640dcb2cb4253d67fa259',      
                    to: '+1' + m.phoneNumber
                    }) 
                    .then(message => console.log(message.sid)) 
                    .done();
                }
            })
        })
    })
}

cron.schedule('* * * * *', () => {
    sendNotifs()
})

app.set('view engine', 'ejs')