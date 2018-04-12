var express = require('express');
var app = express();
var url = require('url');
var path = require('path');
var bodyParser = require('body-parser');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://GonzaloAlvaro:GonzaloAlvaro@cluster0-meuw0.mongodb.net/test";

var port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var num = 0;
var clientes = [];
var juegoAhorcado = false;
var letras = [];
var numeroOportunidades = 0;

io.on('connection', function(cliente) {
	num++;
	cliente.es = false;
	//console.log('Cliente conectado nuevo '+num);
	var mensaje = "¿Qué nombre de usuario quiere utilizar?";
	cliente.emit('volverAPedir', mensaje);

	cliente.on('nick', function (usuario){
		//console.log('Ahora entra bien');
		var nombreUser = usuario.nombreUser;
		var objeto = {exceder: false, existe: false, estado: false};
		if ((nombreUser === "")||(nombreUser === null)){
			objeto.estado = true;
			objeto.nombreVacio = true;
		}else if (nombreUser){
			//console.log('El nombre de usuario es '+nombreUser);
			var tamanoClientes = clientes.length;
			//console.log('Ahora hay '+tamanoClientes);
			if (tamanoClientes <= 10){
				objeto.exceder = false;
				var encontrar = false;
				clientes.forEach(function(item){
					//console.log(item.id)
					var id = item.id;
					if (id == nombreUser){
						encontrar = true;
						//console.log("Existe");
					}
				});
				//console.log("El valor de encontrar es "+encontrar);
				if (!encontrar){
					var nuevoCliente = {id:nombreUser};
					cliente.nombre = nombreUser;
					cliente.numero = num;
					var colorCliente = "ffffff";
					colorCliente = Math.floor((Math.random()*16777216)).toString(16);
					var numeroLetras = colorCliente.length;
					if (numeroLetras < 6){
						colorCliente = "ffffff";
					}
					cliente.color="#"+colorCliente;
					cliente.es = true;
					clientes.push(nuevoCliente);
					cliente.broadcast.emit('nuevoClienteConectado', clientes, nombreUser);

					var mensajesAnt;
					var dato = clientes;
					MongoClient.connect(url, function(err, db1){
						if (err) throw err;
						var dbo = db1.db("test");
						var mysort = {fechaAbsoluta: -1};
						dbo.collection("mensajesChatDefinitivo").find({}).sort(mysort).limit(4).toArray(function(err, mensajesBD){
							if (err) throw err;
							mensajesAnt = mensajesBD;
							db1.close();
							//console.log(mensajesBD);
							cliente.emit('ponteAlDia', dato, mensajesAnt, nombreUser, cliente.color);
						});
					});
				}else{
					objeto.estado = true;
					objeto.existe = true;
				}
				
			}else{
				objeto.exceder = true;
				objeto.estado = true;
			}
		}
		if (objeto.estado){
			if (objeto.existe){
				mensaje = "Este nombre ya existe, por favor seleccione otro";
			} else if(objeto.exceder){
				mensaje = "En estos momentos la sala se encuentra saturada. Inténtelo mas tarde";
			}
			cliente.emit('volverAPedir', mensaje);
		}
		//console.log("");
		//console.log("");
	});

	cliente.on('enviarMensajeChat', function(datos){
		if (cliente.es){
			cliente.broadcast.emit('nuevoMensajeChat', datos);
			MongoClient.connect(url, function(err, db1){
				if (err) throw err;
				var dbo = db1.db("test");
				dbo.collection("mensajesChatDefinitivo").insertOne(datos, function(err, agregado){
					if (err) throw err;
					//console.log("Se ha agregado el nuevo mensaje")
				});
				db1.close();
			});
		}
	});

	cliente.on('usuarioEscribiendo', function(datos){
		cliente.broadcast.emit('escribiendo', datos);
	})

	cliente.on('disconnect', function(){
		if (cliente.es){
			//console.log('Se ha desconectado '+cliente.nombre);
			var nombre = cliente.nombre;
			
			var i = 0;
			var indice = 0;
			clientes.forEach(function(item){
				var id = item.id;
				if (id == nombre){
					encontrar = true;
					indice = i;
				}
				i++;
			});
			clientes.splice(indice,1);
			//console.log(clientes.toString());
			cliente.broadcast.emit('clienteDesconectado', clientes, nombre);
		}
	});

	cliente.on('empezarJuego',function(palabra){
		if (cliente.es){
			var palabraAhorcado = palabra.palabra;
			//console.log("La palabra es "+palabraAhorcado);
			palabraAhorcado = palabraAhorcado.toLowerCase();
			var arrayChar = palabraAhorcado.split("");
			var longitud = arrayChar.length;
			numeroOportunidades = Math.floor(longitud/2);
			var devolver = "";
			juegoAhorcado = true;
			letras = [];
			var j = 0;

			arrayChar.forEach(function(caracter){
				j++;
				var letra = caracter;
				var acertada = false;
				var espacio = false;
				if (letra == " "){
					espacio = true;
				}
				var objetoLetra = {letra: letra, acertada:acertada, espacio:espacio, numeroLetra:j};
				letras.push(objetoLetra);
				if (!espacio){
					devolver = devolver+'<input type="text" name="'+j+'" value="_" size="1" readonly> ';
				}else{
					devolver = devolver+'<input type="text" name="'+j+'" value=" " size="1" readonly> ';
				}
			});

			var objetoADevolver = {fraseDevolver:devolver, numOp:numeroOportunidades, longitud:longitud, hayJuego: juegoAhorcado};
			cliente.broadcast.emit('jugandoAAhorcado',objetoADevolver);
			cliente.emit('jugandoAAhorcado', objetoADevolver);
		}
	});
	


	cliente.on('probarLetra', function(respuesta){
		if (cliente.es){
			//console.log(letras[0]);
			//console.log("Deberia devolver algo");
			var letraDevuelta = respuesta;
			letraDevuelta = letraDevuelta.toLowerCase();
			letraDevuelta = letraDevuelta.split("")[0];
			var esUnEspacio = false;
			if (letraDevuelta == " "){
				esUnEspacio = true;
			}
			//console.log(letraDevuelta);
			var algunAcierto = false;
			var finDeJuego = true;
			var mensajeJuego = "";

			//console.log("Probando la letra "+respuesta);
			if (!esUnEspacio){
				letras.forEach(function(letra){
					var valorLetra = letra.letra;
					if(!letra.espacio){
						if (valorLetra == letraDevuelta){
							letra.acertada = true;
							algunAcierto = true;
						}
						if (!letra.acertada){
							console.log(valorLetra);
							finDeJuego = false;
						}
					}
				});
			}else{
				algunAcierto = true;
				finDeJuego = false;
			}
			
			//console.log(numeroOportunidades +" numero de oportunidades");
			if (!algunAcierto){
				numeroOportunidades = numeroOportunidades -1;
				if (numeroOportunidades < 1){
					mensajeJuego = "Habeis perdido :(";
					finDeJuego = true;
				}else{
					mensajeJuego = "Un intento menos, sigan jugando";
				}
			}else{
				if (!finDeJuego){
					mensajeJuego = "Enhorabuena!! Ya queda menos!!"
				}else{
					mensajeJuego = "Enhorabuena!!! Habeis ganado!!!!"
				}
			}
			var devolverFrase = "";
			//console.log(letras[0]);
			letras.forEach(function(letra){
				var j = letra.numeroLetra;
				//console.log(letra.letra +"Letra a probar");
				if(!letra.espacio){
					if(letra.acertada){
						devolverFrase = devolverFrase+'<input type="text" name="'+j+'" value="'+letra.letra+'" size="1" readonly> ';
					}else{
						devolverFrase = devolverFrase+'<input type="text" name="'+j+'" value="_" size="1" readonly> ';
					}
				}else{
					devolverFrase = devolverFrase+'<input type="text" name="'+j+'" value=" " size="1" readonly> ';
				}
			});
			console.log(finDeJuego +" Habra juego");
			var objetoDeVuelta = {fraseDevolver: devolverFrase, nohayJuego: finDeJuego, numOp: numeroOportunidades, mensaje2: mensajeJuego};
			console.log(objetoDeVuelta);
			cliente.broadcast.emit('comprobarLetra', objetoDeVuelta);
			cliente.emit('comprobarLetra', objetoDeVuelta);
		}
	});
	
});


app.get('/', function(request, response){
	var camino = path.join(__dirname+'/indexWebApp.html');
	response.sendFile(camino);
});


server.listen(port, function (argument) {
	//console.log('Escuchando en el puerto 8080');
});


