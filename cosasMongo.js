var express = require('express');
var app = express();
var url = require('url');
var path = require('path');
var bodyParser = require('body-parser');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var port = process.env.PORT || 8080;

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://GonzaloAlvaro:GonzaloAlvaro@cluster0-meuw0.mongodb.net/test";

var nombreUsuario = "hola7";
var nombreUsuario2 = "hola2";
var mensajeUsuario = "Que pasa con la peñita to guapa";

var agregar = false;
var borrar = false;
var borrarColeccion = false;
var nuevoMensaje = false;
var cargarMensajes = true; //SOlo se llama al conectarse para cargar los 20 ultimos mensajes de ese momento, el resto se iran agregando de forma automatica

if (agregar){
	MongoClient.connect(url, function(err, db1){
		if (err) throw err;
		var dbo = db1.db("test");

		var query = {};
		var mensaje;
		dbo.collection("nuevoCliente").count(query, function(err, numeroV){
			console.log("En estos momentos hay "+ numeroV);
			if ((numeroV < 10)){
				var queryBusqueda = {"nombre": ""};
				queryBusqueda.nombre = nombreUsuario;
				console.log(queryBusqueda);

				dbo.collection("nuevoCliente").find(queryBusqueda).toArray(function(err, resultado){
					if (err) throw err;
					var elementos = resultado.length;
					console.log(elementos);
					if (elementos > 0){
						console.log("Lo sentimos, ese nombre ya esta cogido");
					}else{
						var objeto = {"_id": "", "nombre": ""};
						objeto._id = nombreUsuario;
						objeto.nombre = nombreUsuario;
						console.log(objeto);
						MongoClient.connect(url, function(err, db2){
							if (err) throw err;
							var dbo2 = db2.db("test");
							dbo2.collection("nuevoCliente").insertOne(objeto, function(err, res){
								if (err) throw err;
								console.log("Bienvenido a la nueva sala de chat");
								db2.close();
							});
						});
						console.log("A ver");
					}
				});
				console.log("Se ha hecho la consulta");
			}else{
				mensaje = "En estos momentos la sala está llena. Por favor, trate de conectarse en unos minutos";
				console.log(mensaje);
			}
			db1.close();
		});
	});	
}

if (borrar){
	MongoClient.connect(url, function(err, db1){
		if (err) throw err;
		var dbo = db1.db("test");
		
		var queryBusqueda = {"nombre": ""};
		queryBusqueda.nombre = nombreUsuario2;
		dbo.collection("nuevoCliente").findOneAndDelete(queryBusqueda, function(err, borrado){
			if (err) throw err;
			if (borrado.ok == 1){
				console.log("Se ha borrado el documento");
			}
		});
		db1.close();
	});
}


if (nuevoMensaje){
	MongoClient.connect(url, function(err, db1){
		if (err) throw err;
		var dbo = db1.db("test");
		
		var date = new Date();
		date = Date.parse(date);
		console.log(date);

		var mensajeAgregar = {"usuario": "", "mensaje": "", "hora": 0};
		mensajeAgregar.usuario = nombreUsuario;
		mensajeAgregar.mensaje = mensajeUsuario;
		mensajeAgregar.hora = date;

		dbo.collection("mensajes").insertOne(mensajeAgregar, function(err, agregado){
			if (err) throw err;
			console.log("Se ha agregado el nuevo mensaje")
		});
		db1.close();
	});
}

if (cargarMensajes){ //SOlo se llama al conectarse para cargar los 20 ultimos mensajes de ese momento, el resto se iran agregando de forma automatica
	MongoClient.connect(url, function(err, db1){
		if (err) throw err;
		var dbo = db1.db("test");
		
		var mysort = {hora: -1};
		dbo.collection("mensajes").find({}).sort(mysort).limit(20).toArray(function(err, mensajesBD){
			if (err) throw err;
			console.log(mensajesBD);
		});
		db1.close();
	});
}







if (borrarColeccion && !borrar && !agregar){
	MongoClient.connect(url, function(err, db1){
		if (err) throw err;
		var dbo = db1.db("test");
		
		dbo.collection("nuevoCliente").drop(function(err, borrado){
			if (borrado){
				console.log("Se ha borrado el documento");
			}
		});
		db1.close();
	});
}
console.log("Fin");


