// packages needed in this file
const express = require('express')
// creating express route handler
const router = express.Router()
const Notifications2 = require('../../models/notification.js')

router.post('/create', async (req, res) => {
    const pn = req.body["pn"].replace(/\D+/g, '');
    console.log(pn)
    const id = req.body["id"]
    if(pn == "" || id == "" || pn.length != 10){
        res.status(400).send('Please make sure a valid phone number is entered.')
    }
    else{
        Notifications2.count({testID: id, phoneNumber: pn, sent: {$ne: true}}, function (err, n){
            if(n != 0){
                res.status(400).send('A notification with this test and phone number already exists.')        
            }
            else{
                console.log('creating notif')
                Notifications2.create({ phoneNumber: pn, testID: id })
                res.send('done!')        
            }
        })
    }
})
module.exports = router