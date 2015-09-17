var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var request = require('request');
var htmlparser = require('htmlparser2');
var fs = require('fs');
var cheerio = require('cheerio');


router.get('/getCourses/:unidade', function(req, res){
    var url_raiz = "http://impconcursos.com.br/grade-horaria/";
    var url = url_raiz + req.params.unidade;
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
        res.send(extrairCursosDoHtml(body)); // Show the HTML for the Modulus homepage.
    });
});

/* GET home page. */
router.get('/getGrade/:url_curso', function(req, res, next) {
    //var url = "http://impconcursos.com.br/wp-content/themes/imp/getTurmas.php?q=1425*institutoimp";
    var url_base = "http://impconcursos.com.br/wp-content/themes/imp/getTurmas.php?q=";
    var url = url_base + req.params.url_curso;
    //var url = "http://localhost:8585/imp/teste";
    //var url = req.params.url;
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
        //console.log(body);
        html = verificaDivsHtml(body);

        //console.log("********************************************\n" + body);
        res.send(extrairDadosDoHtml(body)); // Show the HTML for the Modulus homepage.
    });

});

router.get('/teste', function(req, res, next){

    fs.readFile('/home/f9342808/WebstormProjects/imp/teste.html', 'utf8', function(err, html){
        $ = cheerio.load(html);
        var body = verificaDivsHtml(html);
        console.log(html);
        res.send(extrairDadosDoHtml(html));
    });

});

router.get('/teste2', function(req, res, next){

    fs.readFile('/home/f9342808/WebstormProjects/imp/list.html', 'utf8', function(err, html){
        $ = cheerio.load(html);
        res.send(extrairCursosDoHtml(html));
    });

});

function verificaDivsHtml(body){
    var divCount = occurrences(body, "</div>");
    if(divCount >2){
        body = body.replace("</div>", "</td>");
        console.log("Html has some error");
        //console.log(body);
        verificaDivsHtml(body);
    } else {
        return body;
    }
}

function occurrences(string, subString, allowOverlapping){

    string+=""; subString+="";
    if(subString.length<=0) return string.length+1;

    var n=0, pos=0;
    var step=allowOverlapping?1:subString.length;

    while(true){
        pos=string.indexOf(subString,pos);
        if(pos>=0){ ++n; pos+=step; } else break;
    }
    return n;
}

function extrairCursosDoHtml(html){
    $ = cheerio.load(html);
    var cursos = { grupos : []};
    $('select.grade-input').children().each(function(i, elem){
        if($(this).is("OPTGROUP")){
            var grupo = {};
            grupo.nome = $(this).attr('label');
            grupo.curso = [];
            $(this).children().each(function(i, elem){
                var curso = {};
                curso.nome = $(this).text();
                curso.url = $(this).attr('value');
                grupo.curso.push(curso);
            });
            cursos.grupos.push(grupo);
        }
    });
    return cursos;
}

function extrairDadosDoHtml (html){
    console.log(html);
    $ = cheerio.load(html);

    var dia = {};
    var dias = []
    var gradeHoraria = {
        horario :{
            dias:[
            ]
        }
    };
    var datas = [];
    var aulas = [];
    var aula = {};

    gradeHoraria.ultimaAtualizacao = {};
    gradeHoraria.ultimaAtualizacao.dia = $(".conteudo strong").text().split("-")[0].trim();
    gradeHoraria.ultimaAtualizacao.horario = $(".conteudo strong").text().split("-")[1].trim();

    $('thead').children().each(function(i, elem){
        if($(this).text().trim().length > 0) {
            var tituloString = $(this).text();
            var curso = tituloString.split("|")[0].split(":")[1];
            var turma = tituloString.split("|")[1].split(":")[1];
            gradeHoraria.curso = curso;
            gradeHoraria.turma = turma;
        }
    });
    $('tr').children().each(function(i, elem){
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
                    aula.materia = $(this).text();
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
        gradeHoraria.horario.dias.push(dia);
        dia = {};
    }

    return gradeHoraria;
}

module.exports = router;