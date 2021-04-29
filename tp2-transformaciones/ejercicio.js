// Esta función construye una matriz de transfromación de 3x3 en coordenadas homogéneas 
// utilizando los parámetros de posición, rotación y escala. La estructura de datos a 
// devolver es un arreglo 1D con 9 valores en orden "column-major". Es decir, para un 
// arreglo A[] de 0 a 8, cada posición corresponderá a la siguiente matriz:
//
// | A[0] A[3] A[6] |
// | A[1] A[4] A[7] |
// | A[2] A[5] A[8] |
// 
// Se deberá aplicar primero la escala, luego la rotación y finalmente la traslación. 
// Las rotaciones vienen expresadas en grados. 
function BuildTransform(positionX, positionY, rotation, scale )
{
	var transform = scaleTransform(scale);
	transform = ComposeTransforms(transform, rotationTransform(rotation));
	transform = ComposeTransforms(transform, translationTransform(positionX, positionY));
	return transform;
}

// Esta función retorna una matriz que resula de la composición de trasn1 y trans2. Ambas 
// matrices vienen como un arreglo 1D expresado en orden "column-major", y se deberá 
// retornar también una matriz en orden "column-major". La composición debe aplicar 
// primero trans1 y luego trans2. => queremos trans2 @ trans1
// trans[i][j] = trans[j * 3 + i]
function ComposeTransforms(trans1, trans2)
{
	//
	var res = Array(0,0,0,0,0,0,0,0,0);
	for (var i = 0; i < 3; i ++){
		for (var j = 0; j < 3; j ++){
			for (var k = 0; k < 3; k ++){
				res[j * 3 + i] += trans2[k * 3 + i] * trans1[j * 3 + k]
			}
		}
	}
	return res;
}


function translationTransform(positionX, positionY){
	return Array(1, 0, 0, 0, 1, 0, positionX, positionY, 1);
}


function rotationTransform(phi){
	// Degrees to radians
	var theta = phi * Math.PI / 180;
	return Array(Math.cos(theta), Math.sin(theta), 0,
				-Math.sin(theta), Math.cos(theta), 0,
				 0, 0, 1);
}


function scaleTransform(scale){
	return Array(scale, 0, 0, 0, scale, 0, 0, 0, 1);
}