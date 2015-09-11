var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
    var url = "http://impconcursos.com.br/wp-content/themes/imp/getTurmas.php?q=1425*institutoimp";
    request({
        uri: url,
        method: "GET",
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10
    }, function(error, response, body) {
        //Check for error
        if(error){
            res.send('Error:', error);
        }

        //Check for right status code
        if(response.statusCode !== 200){
            res.send('Invalid Status Code Returned:', response.statusCode);
        }

        //All is good. Print the body
        res.send(body); // Show the HTML for the Modulus homepage.
    });

});

module.exports = router;