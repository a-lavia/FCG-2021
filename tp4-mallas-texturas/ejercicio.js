// <============================================ EJERCICIOS ============================================>
// a) Implementar la función:
//
//      GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
//
//    Si la implementación es correcta, podrán hacer rotar la caja correctamente (como en el video). IMPORTANTE: No
//    es recomendable avanzar con los ejercicios b) y c) si este no funciona correctamente.
//
// b) Implementar los métodos:
//
//      setMesh( vertPos, texCoords )
//      swapYZ( swap )
//      draw( trans )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado, asi como también intercambiar
//    sus coordenadas yz. Para reenderizar cada fragmento, en vez de un color fijo, pueden retornar:
//
//      gl_FragColor = vec4(1,0,gl_FragCoord.z*gl_FragCoord.z,1);
//
//    que pintará cada fragmento con un color proporcional a la distancia entre la cámara y el fragmento (como en el video).
//    IMPORTANTE: No es recomendable avanzar con el ejercicio c) si este no funciona correctamente.
//
// c) Implementar los métodos:
//
//      setTexture( img )
//      showTexture( show )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado y su textura.
//
// Notar que los shaders deberán ser modificados entre el ejercicio b) y el c) para incorporar las texturas.
// <=====================================================================================================>



// Esta función recibe la matriz de proyección (ya calculada), una traslación y dos ángulos de rotación
// (en radianes). Cada una de las rotaciones se aplican sobre el eje x e y, respectivamente. La función
// debe retornar la combinación de las transformaciones 3D (rotación, traslación y proyección) en una matriz
// de 4x4, representada por un arreglo en formato column-major. El parámetro projectionMatrix también es
// una matriz de 4x4 alamcenada como un arreglo en orden column-major. En el archivo project4.html ya está
// implementada la función MatrixMult, pueden reutilizarla.

function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	// [COMPLETAR] Modificar el código para formar la matriz de transformación.

	// Matriz de traslación
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

  var rotX = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), Math.sin(rotationX), 0,
		0, -Math.sin(rotationX), Math.cos(rotationX), 0,
		0, 0, 0, 1
	];

  var rotY = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1
	];

	var mvp = MatrixMult( projectionMatrix, trans );
  mvp = MatrixMult( mvp, rotX );
  mvp = MatrixMult( mvp, rotY );
	return mvp;
}

// [COMPLETAR] Completar la implementación de esta clase.
class MeshDrawer
{
	// El constructor es donde nos encargamos de realizar las inicializaciones necesarias.
	constructor()
	{
		// [COMPLETAR] inicializaciones

		// 1. Compilamos el programa de shaders
		this.prog = InitShaderProgram(meshVS, meshFS);
		// 2. Obtenemos los IDs de las variables uniformes en los shaders
		this.mvp = gl.getUniformLocation(this.prog, 'mvp');
		// 3. Obtenemos los IDs de los atributos de los vértices en los shaders
		this.pos = gl.getAttribLocation(this.prog, 'pos');
		// 4. Obtenemos los IDs de los atributos de los vértices en los shaders
		this.tex = gl.getAttribLocation(this.prog, 'tex');
		this.enableTex = gl.getUniformLocation(this.prog, 'enableTex');
		this.sampler = gl.getUniformLocation(this.prog, 'texGPU');

	}

	// Esta función se llama cada vez que el usuario carga un nuevo archivo OBJ.
	// En los argumentos de esta función llegan un areglo con las posiciones 3D de los vértices
	// y un arreglo 2D con las coordenadas de textura. Todos los items en estos arreglos son del tipo float.
	// Los vértices se componen de a tres elementos consecutivos en el arreglo vertexPos [x0,y0,z0,x1,y1,z1,..,xn,yn,zn]
	// De manera similar, las cooredenadas de textura se componen de a 2 elementos consecutivos y se
	// asocian a cada vértice en orden.
	setMesh( vertPos, texCoords )
	{
		// [COMPLETAR] Actualizar el contenido del buffer de vértices
		this.numTriangles = vertPos.length / 3;
		this.positions = vertPos;
		this.positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);

		this.texCoord = texCoords;
		this.texCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texCoord), gl.STATIC_DRAW);
	}

	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Intercambiar Y-Z'
	// El argumento es un boleano que indica si el checkbox está tildado
	swapYZ( swap )
	{
		// [COMPLETAR] Setear variables uniformes en el vertex shader
		this.invertedPositions = [];
		for (var i = 0; i < this.positions.length / 3; i++) {
			var tidx = i * 3;
		  this.invertedPositions.push(this.positions[tidx]);
		  this.invertedPositions.push(this.positions[tidx + 2]);
		  this.invertedPositions.push(this.positions[tidx + 1]);
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		if (swap){
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.invertedPositions), gl.STATIC_DRAW);
		}
		else {
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);
		}

	}

	// Esta función se llama para dibujar la malla de triángulos
	// El argumento es la matriz de transformación, la misma matriz que retorna GetModelViewProjection
	draw( trans )
	{
		// [COMPLETAR] Completar con lo necesario para dibujar la colección de triángulos en WebGL
		if (this.positions == null) return;

		// 1. Seleccionamos el shader
		gl.useProgram(this.prog);

		// 2. Setear matriz de transformacion
		gl.uniformMatrix4fv(this.mvp, false, trans);

		// 3.Binding de los buffers
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.vertexAttribPointer(this.pos, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.pos);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.vertexAttribPointer(this.tex, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.tex);

		// Dibujamos
		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
	}

	// Esta función se llama para setear una textura sobre la malla
	// El argumento es un componente <img> de html que contiene la textura.
	setTexture( img )
	{
		// [COMPLETAR] Binding de la textura
		this.textura = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.textura);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
		gl.generateMipmap(gl.TEXTURE_2D);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.textura);

		gl.useProgram(this.prog);
		gl.uniform1i(this.sampler, 0);  // Unidad 0
		gl.uniform1i(this.enableTex, true);
	}

	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Mostrar textura'
	// El argumento es un boleano que indica si el checkbox está tildado
	showTexture( show )
	{
		// [COMPLETAR] Setear variables uniformes en el fragment shader
		if (this.textura != null) {
			gl.useProgram(this.prog);
			gl.uniform1i(this.enableTex, show);
		}
	}
}

// Vertex Shader
// Si declaras las variables pero no las usas es como que no las declaraste y va a tirar error. Siempre va punto y coma al finalizar la sentencia.
// Las constantes en punto flotante necesitan ser expresadas como x.y, incluso si son enteros: ejemplo, para 4 escribimos 4.0
var meshVS = `
	attribute vec3 pos;
	attribute vec2 tex;
	uniform mat4 mvp;
	varying vec2 texCoord;
	void main()
	{
		gl_Position = mvp * vec4(pos,1);
		texCoord = tex;
	}
`;

// Fragment Shader
var meshFS = `
	precision mediump float;
	uniform sampler2D texGPU;
	uniform bool enableTex;
	varying vec2 texCoord;
	void main()
	{
		if (enableTex) {
			gl_FragColor = texture2D(texGPU, texCoord);
		} else {
			gl_FragColor = vec4(1, 0, gl_FragCoord.z*gl_FragCoord.z, 1);
		}
	}
`;
