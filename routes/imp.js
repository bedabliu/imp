var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var request = require('request');
var htmlparser = require('htmlparser2');
var fs = require('fs');
var cheerio = require('cheerio');

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
            dias:[
            ]
        }
    };
    var datas = [];
    var aulas = [];
    var aula = {};
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

        $ = cheerio.load(html);
        $('thead').children().each(function(i, elem){
            if($(this).text().trim().length > 0) {
                gradeHoraria.titulo = $(this).text();
            }
        });
        $('tbody').children().children().each(function(i, elem){
            if($(this).text().trim().length > 0) {
                if($(this).hasClass("grade-dia")){
                    var data = $(this).text().slice($(this).text().length - 11);
                    datas.push(data);
                }
                if($(this).hasClass("grade-aula")){
                    var aulaString = $(this).text();
                    if($(this).children().length > 1){
                        if($(this).children().length < 4) {
                            $(this).children().each(function (i, elem) {
                                switch (i) {
                                    case 0:
                                        aula.professor = $(this).text();
                                        break;
                                    case 1:
                                        aula.materia = $(this).text();
                                        break;
                                    case 2:
                                        aula.quantidade = $(this).text();
                                        break;
                                    default:
                                        break;
                                }
                            });
                        } else if ($(this).children().length > 3 && $(this).children().length < 6){
                            $(this).children().each(function (i, elem) {
                                switch (i) {
                                    case 0:
                                        aula.codigoTurma = $(this).text();
                                        break;
                                    case 1:
                                        aula.horario = $(this).text();
                                        break;
                                    case 2:
                                        aula.professor = $(this).text();
                                        break;
                                    case 3:
                                        aula.materia = $(this).text();
                                        break;
                                    case 4:
                                        aula.quantidade = $(this).text();
                                        break;
                                    default:
                                        break;
                                }
                            });
                        } else if ($(this).children().length > 6){
                            $(this).children().each(function (i, elem) {
                                switch (i) {
                                    case 0:
                                        aula.codigoTurma = $(this).text();
                                        break;
                                    case 1:
                                        aula.horario = $(this).text();
                                        break;
                                    case 2:
                                        aula.professor = $(this).text();
                                        break;
                                    case 3:
                                        aula.materia = $(this).text();
                                        break;
                                    case 4:
                                        aula.quantidade = $(this).text();
                                        break;
                                    case 6:
                                        aula.codigoTurma2 = $(this).text();
                                        break;
                                    case 7:
                                        aula.horario2 = $(this).text();
                                        break;
                                    case 8:
                                        aula.professor2 = $(this).text();
                                        break;
                                    case 9:
                                        aula.materia2 = $(this).text();
                                        break;
                                    case 10:
                                        aula.quantidade2 = $(this).text();
                                        break;
                                    default:
                                        break;
                                }
                            });
                        }
                    } else {
                        aula.materia = "Sem Aula";
                    }
                    aulas.push(aula);
                    aula = {};
                }

                //console.log(">>>" + $(this).text());
            }
        });
        for(x = 0; x < datas.length; x++){
            dia.diaDaSemana = datas[x];
            dia.materia = aulas[x].materia;
            if(aulas[x].professor != undefined) {
                dia.professor = aulas[x].professor;
            }
            if(aulas[x].quantidade != undefined) {
                dia.aulasDadas = aulas[x].quantidade.split('/')[0];
                dia.aulasTotal = aulas[x].quantidade.split('/')[1];
            }
            dias.push(dia);
            dia = {};
        }
        console.log($(".conteudo strong").text());
        res.send(dias);
        //console.log($('table').children('tbody'));
        //res.send(gradeHoraria);

        //var handler = new htmlparser.DomHandler(function (error, dom) {
        //    if (error)
        //        console.log(error);
        //    else
        //        console.log(dom);
        //    res.send(dom);
        //});
        //var parser = new htmlparser.Parser(handler);
        //parser.write(html);
        //parser.done();
    });
    //    var parser = new htmlparser.Parser({
    //        onopentag: function(name, attribs){
    //            if(attribs.class != undefined) {
    //                if (attribs.class.indexOf("titulo-cursotab") != -1) {
    //                    atributo = "titulo-curso";
    //                    gradeHoraria.titulo = "";
    //                    console.log("Titulo do Curso");
    //                }
    //            }
    //            if(name == "thead"){
    //                ehTitulo = true;
    //            }
    //            if(name == "tr") {
    //                novaLinha = false;
    //            }
    //            if(name = "td"){
    //                if(attribs.class != undefined){
    //                    if(attribs.class.indexOf("grade-dia") != -1){
    //                        colunaDado = "dia";
    //                    }
    //                    if(attribs.class.indexOf("grade-aula") != -1){
    //                        colunaAula = true;
    //                    }
    //                }
    //            }
    //            if(name == "p"){
    //                console.log("p");
    //                if(colunaAula) {
    //                    if (numeroColunaDado == 0) {
    //                        colunaDado = "professor";
    //                    }
    //                    if (numeroColunaDado == 1) {
    //                        colunaDado = "aula";
    //                    }
    //                    if (numeroColunaDado == 2) {
    //                        colunaDado = "numeroAulas";
    //                    }
    //                }
    //            }
    //        },
    //        ontext: function(text){
    //            if(atributo == "titulo-curso"){
    //                gradeHoraria.titulo += text;
    //            }
    //            if(colunaDado == "dia"){
    //                console.log(text);
    //                dia.diaSemana = text;
    //                //gradeHoraria.horario.semana[numeroLinha].dia[numeroColuna].diaSemana = text;
    //            }
    //            if(colunaDado == "aula"){
    //                dia.aula = text;
    //                //gradeHoraria.horario.semana[numeroLinha].dia[numeroColuna].aula = text;
    //            }
    //            if(colunaDado == "professor"){
    //                dia.professor = text;
    //                //console.log("====>" + text);
    //                //gradeHoraria.horario.semana[numeroLinha].dia[numeroColuna].professor = text;
    //            }
    //            if(colunaDado == "numeroAulas"){
    //                dia.numeroAulas = text;
    //                //gradeHoraria.horario.semana[numeroLinha].dia[numeroColuna].numeroAulas = text;
    //            }
    //            //console.log("-->", text);
    //        },
    //        onclosetag: function(tagname){
    //            if(tagname == "thead") {
    //               console.log("Fim do Titulo");
    //                ehTitulo = false;
    //                atributo = "";
    //            }
    //            if(tagname == "tr"){
    //                console.log(dias);
    //                if(!ehTitulo) {
    //                    gradeHoraria.horario.semana[numeroLinha] = dias;
    //                    dias = [];
    //                    numeroLinha++;
    //                }
    //            }
    //            if(tagname == "p"){
    //                if(colunaAula){
    //                    numeroColuna++;
    //                    colunaDado = "";
    //                }
    //            }
    //            if(tagname == "td"){
    //                colunaDado = "";
    //                numeroColunaDado = 0;
    //                dias.push(dia);
    //                dia = {};
    //                colunaAula = false;
    //            }
    //        }
    //    }, {decodeEntities: true});
    //    parser.write(html);
    //    parser.done();
    //    res.send(gradeHoraria);
    //});
   //res.sendFile('/home/f9342808/WebstormProjects/imp/teste.html');
});

module.exports = router;