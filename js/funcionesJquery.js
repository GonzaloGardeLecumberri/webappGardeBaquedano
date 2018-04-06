$(document).ready(function(){

	var modificarTabla = function(producto, cantidad, precio){
		var precioBicho = 0;
		var cantidadBicho = 0;
		var totalBicho = 0;
		if (producto === "toro") {
			precioBicho = $("#precioÑu");
			cantidadBicho = $("#cantidadÑu");
			totalBicho = $("#totalÑu")
		} else if (producto === "mono") {
			precioBicho = $("#precioLemur");
			cantidadBicho = $("#cantidadLemur");
			totalBicho = $("#totalLemur")
		} else {
			precioBicho = $("#precioKiwi");
			cantidadBicho = $("#cantidadKiwi");
			totalBicho = $("#totalKiwi")
		}
		precioBicho.empty();
		precioBicho.append(precio);
		cantidadBicho.empty();
		cantidadBicho.append(cantidad);

		total = cantidad * precio;
		totalBicho.empty();
		totalBicho.append(total);

		var precioCarro = 0;
		//hasta aqui bien
		precioCarro = parseInt($("#totalÑu").text())+parseInt($("#totalKiwi").text())+parseInt($("#totalLemur").text());
		
		$("#precioDelCarro").empty();
		$("#precioDelCarro").append("<p>El precio del carrito para los objetos acumulados es: <h3>"+precioCarro+" euros</h3>");
	};
	var funPrecio = function (imagen) {
		var objetivo = $("#objetivo1");
		objetivo.empty();
		
		var precio = 0;
		var valor = 0;
		if (imagen === "toro") {
			precio = 15;
			valor = $("#cantidadÑu").text();
		} else if (imagen === "mono") {
			precio = 10;
			valor = $("#cantidadLemur").text();
		} else {
			precio = 5;
			valor = $("#cantidadKiwi").text();
		}
		var frase = "El precio es de "+precio+" euros";
		var contenido = '<p>'+frase+'</p>';
		objetivo.append(contenido);
		objetivo.append('<p>Unidades:<input class="cantidad" data-producto="'+imagen+'" data-precio="'+precio+'" type="number" name="unidades" value="'+valor+'" min="0">');
		
		var $input = $(".cantidad");

		$input.on('keyup mouseup',function(event){
			var precio = $(this).attr("data-precio");
			var producto = $(this).attr("data-producto");
			var cantidad = $(this).val();
			$(this).attr("value",cantidad);
			modificarTabla(producto,cantidad,precio);
		});
	};

	var funDescripcion = function (imagen) {
		var objetivo = $("#objetivo1");
		objetivo.empty();
		var contenido;
		if (imagen === "toro") {
			contenido = "Realmente no se trata de un toro famelico, sino de un ñu bien hermoso con unos cuernecitos que para que vamos a hablar, un gusto tener un ñu así por casa, cariñoso con los niños, te rellena la quiniela, el mejor amigo del hombre sin duda.";
		} else if (imagen === "mono") {
			contenido = "Decir que se trata de un tipo de mono es una aberración. Los lémures son unos primates estrepsirrinos endémicos de la isla de Madagascar. Reciben su nombre por los lémures, fantasmas o espíritus de la mitología romana, debido a las estrepitosas vocalizaciones que emiten, sus ojos brillantes y los hábitos nocturnos de algunas de sus especies. Aunque a menudo se les confunda con primates ancestrales, los primates antropoides (monos, hominoides y seres humanos) no evolucionaron de los lémures, aunque comparten rasgos morfológicos y de comportamiento con primates basales.";
		} else {
			contenido = "Esto es un kiwi, imagino que también se puede tomar de postre pero seguramente sería un poco turbio";
		}
		var frase = '<p>'+contenido+'</p>';
		objetivo.append(frase);
	}

	var funImagen = function (imagen) {
		var objetivo = $("#objetivo1");
		objetivo.empty();

		var imagenSec1 = $("#imagenSec1");
		var linkImg1;
		var imagenSec2 = $("#imagenSec2");
		var linkImg2;
		var imagenSec3 = $("#imagenSec3");
		var linkImg3;
		 //Hasta aqui bien
		if (imagen === "toro") {
			linkImg1 = "Imagenes/nu.jpeg";
			linkImg2 = "Imagenes/nu2.jpeg";
			linkImg3 = "Imagenes/nu3.jpeg";

		} else if (imagen === "mono") {
			linkImg1 = "Imagenes/lemur.jpeg";
			linkImg2 = "Imagenes/lemur2.jpeg";
			linkImg3 = "Imagenes/lemur3.jpeg";
		} else {
			linkImg1 = "Imagenes/kiwi.jpg";
			linkImg2 = "Imagenes/kiwi2.jpeg";
			linkImg3 = "Imagenes/kiwi3.jpeg";
		}
		objetivo.append('<div id="galeriaImagenes row">\
						<div class="col-12">\
							<img src="'+linkImg1+'" id="imagenPrincipal" width="200" height="200">\
						</div>\
						<div class="col-12 row">\
							<div class="d-inline bg-success">\
								<img src="'+linkImg1+'" id="imagenSec1" width="42" height="42" class="d-inline-block imagenSecu">\
							</div>\
							<div class="d-inline bg-success">\
								<img src="'+linkImg2+'" id="imagenSec2" width="42" height="42" class="d-inline-block imagenSecu">\
							</div>\
							<div class="d-inline bg-success">\
								<img src="'+linkImg3+'" id="imagenSec3" width="42" height="42" class="d-inline-block imagenSecu">\
							</div>\
						</div>\
					</div>');
		
		var cambiarImgPrin = $(".imagenSecu");
		cambiarImgPrin.on('click',function(){
			var $src = $(this).attr('src');
			var imagenPrin = $("#imagenPrincipal");
			imagenPrin.attr("src",$src);
		});
	};

	var productos = $(".producto");
	productos.on('click', function(){
		$("#botonera").show();
		var objetivo = $("#objetivo1");
		objetivo.empty();
		var $atributo = $(this).attr('data-imagen');

		objetivo.append("<p>Producto: "+$atributo+"</p>");

		var $botonPrecio = $("#precio");
		$botonPrecio.off('click');
		$botonPrecio.on('click', function(event){
			event.preventDefault();
			funPrecio($atributo);
		});

		var $botonDescripcion = $("#descripcion");
		$botonDescripcion.off('click');
		$botonDescripcion.on('click', function(event){
			event.preventDefault();
			funDescripcion($atributo);
		});

		var $botonImagenes = $("#imagenes");
		$botonImagenes.off('click');
		$botonImagenes.on('click', function(event){
			event.preventDefault();
			funImagen($atributo);
		});
	});
});