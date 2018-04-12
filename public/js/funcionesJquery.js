$(document).ready(function(){
	window.emojiPicker = new EmojiPicker({
		emojiable_selector: '[data-emojiable=true]',
		assetsPath: '../lib/img/',
		popupButtonClasses: 'fa fa-smile-o'
	});
	window.emojiPicker.discover();
	
	function bajarScroll(){
		var element = $('#mensajesRecibidos');
		element.animate({scrollTop: element.prop('scrollHeight')});
		$('html,body').animate({scrollTop: document.body.scrollHeight});
	}

	var socket = io.connect({'sync disconnect on unload':true});

	socket.on('volverAPedir', function(datos){
		var usuario = prompt(datos);
		console.log("Emitiendo nombre usuario");
		socket.emit('nick', {nombreUser: usuario});
		console.log(usuario);
	});
	var miNombre;
	var miColor;
	var padre = $('#usuariosConectados');
	var tamVentana = $(window).height();
	$('#mensajesRecibidos').css("max-height",tamVentana*0.9*0.7);


	socket.on('ponteAlDia', function(conectados, mensajes, nombre, color){
		console.log('Esta conectado '+conectados[0].id);
		console.log(mensajes[0]);
		miNombre = nombre;
		miColor = color;
		var numero = 1;
		conectados.forEach(function(conectado){
			var nombre = conectado.id;
			var nombreSin = nombre.replace(/ /g, '_');
			var frase = `
				<tr id="${nombre}" data-numero="${numero}">
					<th scope="row">${numero}</th>
					<th>${nombre}</th>
					<th id="estado${nombreSin}">Conectado</th>
				</tr>
			`;
			padre.append(frase);
			numero++;
		});
		mensajes = mensajes.reverse();
		mensajes.forEach(function(cadaMensaje){
			var anadir2= `
				<div class='offset-3 col-6 text-left text-dark' style="margin-top:5px;margin-bottom:5px;border-left: 6px solid black;
    background-color: lightgrey;box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19);">
					<p>${cadaMensaje.usuario}</p>
					<div style="overflow-wrap:break-word">${cadaMensaje.mensajeEnviar}</div>
					<p>${cadaMensaje.fecha}</p>
				</div>
			`;
			$('#mensajesRecibidos').append(anadir2);
			bajarScroll();
		});
		var anadir= `
			<div class="col-12 text-center">
					<hr>
					<p>Mensajes Antiguos</p>
					<hr>
			</div>
			`;
		$('#mensajesRecibidos').append(anadir);
		bajarScroll();
		
	});

	socket.on('clienteDesconectado', function(clientes, nombreDesc){
		console.log('Se ha desconectado '+nombreDesc);
		padre.empty();
		var numero = 1;
		clientes.forEach(function(conectado){
			var nombre = conectado.id;
			var nombreSin = nombre.replace(/ /g, '_');
			var frase = `
				<tr id="${nombre}" data-numero="${numero}">
					<th scope="row">${numero}</th>
					<th>${nombre}</th>
					<th id="estado${nombreSin}">Conectado</th>
				</tr>
			`;
			padre.append(frase);
			numero++;
		});
		var anadir= `
			<div class="col-12 text-center">
					<hr>
					<p>Se ha desconectado el usuario ${nombreDesc}</p>
					<hr>
			</div>
			`;
		$('#mensajesRecibidos').append(anadir);
		bajarScroll();
	});

	socket.on('nuevoClienteConectado', function(clientes, nombreCon){
		console.log('Se ha conectado '+nombreCon);
		padre.empty();
		var numero = 1;
		clientes.forEach(function(conectado){
			var nombre = conectado.id;
			var nombreSin = nombre.replace(/ /g, '_');
			var frase = `
				<tr id="${nombre}" data-numero="${numero}">
					<th scope="row">${numero}</th>
					<th>${nombre}</th>
					<th id="estado${nombreSin}">Conectado</th>
				</tr>
			`;
			padre.append(frase);
			numero++;
		});
		var anadir= `
				<div class="col-12 text-center">
					<hr>
					<p>Se ha conectado el usuario ${nombreCon}</p>
					<hr>
				</div>
			`;
		$('#mensajesRecibidos').append(anadir);
		bajarScroll();
	});

	$('#formMensaje').on('submit', function(event) {
		event.preventDefault();
		var time = new Date();
		var hora = time.getHours();
		var min = time.getMinutes();
		var fecha = hora+":"+min;
		var nuevoMensaje = $('#formMensaje textarea[name=mensaje]').val();
		console.log(miColor);
		var anadir= `
			<div class='offset-4 col-6  text-right text-dark' style="margin-top:5px;margin-bottom:5px;border-right: 6px solid;border-right-color: ${miColor};
    background-color: #c6e4ff;box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19);">
				<p>Yo</p>
				<div style="overflow-wrap:break-word">${nuevoMensaje}</div>
				<p>${fecha}</p>
			</div>
		`;
		$('#mensajesRecibidos').append(anadir);
		bajarScroll();
		var fechaAbsoluta = new Date().getTime();
		console.log(fechaAbsoluta);
		socket.emit('enviarMensajeChat', {mensajeEnviar: nuevoMensaje, fecha: fecha, usuario: miNombre, color: miColor, fechaAbsoluta: fechaAbsoluta});
		$('#formMensaje').each(function(){
			this.reset();
		});
		$('.mensajeUser').empty();
	});

	socket.on('nuevoMensajeChat', function(datos){
		var anadir2= `
			<div class='offset-2 col-6 text-left text-dark' style="margin-top:5px;margin-bottom:5px;border-left: 6px solid;border-left-color: ${datos.color};
    background-color: lightgrey;box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19);">
				<p>${datos.usuario}</p>
				<div style="overflow-wrap:break-word">${datos.mensajeEnviar}</div>
				<p>${datos.fecha}</p>
			</div>
		`;
		$('#mensajesRecibidos').append(anadir2);
		bajarScroll();
	});

	var inicioTemp = false;
	var tiempo = 0;
	$('.mensajeUser').keypress(function(event) {
		var nombreSin = "#estado"+miNombre.replace(/ /g, '_');
		socket.emit('usuarioEscribiendo', nombreSin);
		$(nombreSin).empty();
		$(nombreSin).append("Escribiendo");
		if (inicioTemp){
			console.log("Hola, reseteando");
			clearTimeout(tiempo);
		}
		inicioTemp = true;
		tiempo = setTimeout(function(){
			console.log("Hola, haciendo");
			$(nombreSin).empty();
			$(nombreSin).append("Conectado");
			inicioTemp = false;
		},2500);
	});

	var inicioTemp2 = false;
	var tiempo2 = 0;
	socket.on('escribiendo', function(nombreSin){
		$(nombreSin).empty();
		$(nombreSin).append("Escribiendo");
		if (inicioTemp2){
			console.log("Hola, reseteando");
			clearTimeout(tiempo2);
		}
		inicioTemp2 = true;
		var tiempo2 = setTimeout(function(){
			console.log("Hola, haciendo");
			$(nombreSin).empty();
			$(nombreSin).append("Conectado");
			inicioTemp2 = false;
		},2500);
	});

	$('#formRespuestaJuego').hide();
	var jugando = false;
	var juegoMio = false;
	$('#formJuegoAhorcado').on('submit', function(event) {
		if (!jugando){
			event.preventDefault();
			var nuevoMensaje = $('#formJuegoAhorcado input[name=palabraAhorcado]').val();
			var anadir= `
				<div class='col-12>
					Ahora estan jugando a un juego
				</div>
			`;
			jugando = true;
			juegoMio = true;
			$('#formJuegoAhorcado').hide();
			$('#formJuegoAhorcado').each(function(){
				this.reset();
			});
			bajarScroll();
			socket.emit('empezarJuego', {palabra: nuevoMensaje});
		}
	});

	socket.on('jugandoAAhorcado', function(objeto){
		if (!juegoMio){
			console.log("Estoy jugando a ahorcado");
			$('#formJuegoAhorcado').hide();
			$('#formRespuestaJuego').show();
			var fraseDev = objeto.fraseDevolver;
			var numOp = objeto.numOp;
			var anadir3 = `
				${fraseDev}
				<p>Quedan ${numOp} oportunidades</p>
			`;
			$('#pista').empty();
			$('#pista').append(anadir3);
			bajarScroll();	
		}
	});

	$('#formRespuestaJuego').on('submit', function(event) {
		event.preventDefault();
		var letra = $('#formRespuestaJuego input[name=respuestaAhorcado]').val();
		$('#formRespuestaJuego').each(function(){
			this.reset();
		});
		console.log('Probando una letra');
		socket.emit('probarLetra',letra);
	});

	socket.on('comprobarLetra', function(objeto){
		if (!juegoMio){
			if (!objeto.nohayJuego){
				var fraseDev = objeto.fraseDevolver;
				var numOp = objeto.numOp;
				var anadir3 = `
					${fraseDev}
					<p>Quedan ${numOp} oportunidades</p>
				`;
				$('#pista').empty();
				$('#pista').append(anadir3);
			}else{
				$('#formRespuestaJuego').hide();
				$('#formJuegoAhorcado').show();
				jugando = false;
				alert(objeto.mensaje2);
				bajarScroll();
			}
		}else{
			if (objeto.nohayJuego){
				jugando = false;
				juegoMio = false;
				alert(objeto.mensaje2+" que pasa campeon");
				$('#formJuegoAhorcado').show();
				bajarScroll();
			}
		}
	});
});