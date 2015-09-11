var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var request = require('request');
var htmlparser = require('htmlparser2');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
    //var url = "http://impconcursos.com.br/wp-content/themes/imp/getTurmas.php?q=1425*institutoimp";
    var url = "http://localhost:8585/imp/teste";
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
        var parser = new htmlparser.parseDOM(body);
        console.log(parser);

        res.send(body); // Show the HTML for the Modulus homepage.
    });

});

router.get('/teste', function(req, res, next){
    var dia = {};
    var dias = []
    var gradeHoraria = {
        titulo : "",
        horario :{
            semana:[
            ]
        }
    };
    var atributo;
    var novaLinha = true;
    var numeroLinha = 0;
    var coluna = {};
    var colunaDado;
    var numeroColunaDado = 0;
    var numeroColuna = 0;
    var ehTitulo = false;
    var colunaAula = false;
    var saida = "";
    fs.readFile('/home/f9342808/WebstormProjects/imp/teste.html', 'utf8', function(err, html){
        var parser = new htmlparser.Parser({
            onopentag: function(name, attribs){
                if(attribs.class != undefined) {
                    if (attribs.class.indexOf("titulo-cursotab") != -1) {
                        atributo = "titulo-curso";
                        gradeHoraria.titulo = "";
                        console.log("Titulo do Curso");
                    }
                }
                if(name == "thead"){
                    ehTitulo = true;
                }
                if(name == "tr") {
                    novaLinha = false;
                }
                if(name = "td"){
                    if(attribs.class != undefined){
                        if(attribs.class.indexOf("grade-dia") != -1){
                            colunaDado = "dia";
                        }
                        if(attribs.class.indexOf("grade-aula") != -1){
                            colunaAula = true;
                        }
                    }
                }
                if(name == "p"){
                    console.log("p");
                    if(colunaAula) {
                        if (numeroColunaDado == 0) {
                            colunaDado = "professor";
                        }
                        if (numeroColunaDado == 1) {
                            colunaDado = "aula";
                        }
                        if (numeroColunaDado == 2) {
                            colunaDado = "numeroAulas";
                        }
                    }
                }
            },
            ontext: function(text){
                if(atributo == "titulo-curso"){
                    gradeHoraria.titulo += text;
                }
                if(colunaDado == "dia"){
                    console.log(text);
                    dia.diaSemana = text;
                    //gradeHoraria.horario.semana[numeroLinha].dia[numeroColuna].diaSemana = text;
                }
                if(colunaDado == "aula"){
                    dia.aula = text;
                    //gradeHoraria.horario.semana[numeroLinha].dia[numeroColuna].aula = text;
                }
                if(colunaDado == "professor"){
                    dia.professor = text;
                    //console.log("====>" + text);
                    //gradeHoraria.horario.semana[numeroLinha].dia[numeroColuna].professor = text;
                }
                if(colunaDado == "numeroAulas"){
                    dia.numeroAulas = text;
                    //gradeHoraria.horario.semana[numeroLinha].dia[numeroColuna].numeroAulas = text;
                }
                //console.log("-->", text);
            },
            onclosetag: function(tagname){
                if(tagname == "thead") {
                   console.log("Fim do Titulo");
                    ehTitulo = false;
                    atributo = "";
                }
                if(tagname == "tr"){
                    console.log(dias);
                    if(!ehTitulo) {
                        gradeHoraria.horario.semana[numeroLinha] = dias;
                        dias = [];
                        numeroLinha++;
                    }
                }
                if(tagname == "p"){
                    if(colunaAula){
                        numeroColuna++;
                        colunaDado = "";
                    }
                }
                if(tagname == "td"){
                    colunaDado = "";
                    numeroColunaDado = 0;
                    dias.push(dia);
                    dia = {};
                    colunaAula = false;
                }
            }
        }, {decodeEntities: true});
        parser.write(html);
        parser.done();
        res.send(gradeHoraria);
    });
   //res.sendFile('/home/f9342808/WebstormProjects/imp/teste.html');
});

module.exports = router;