// La imagen que tienen que modificar viene en el parámetro image y contiene inicialmente los datos originales
// es objeto del tipo ImageData ( más info acá https://mzl.la/3rETTC6  )
// Factor indica la cantidad de intensidades permitidas (sin contar el 0)

function dither(image, factor) {
    var palette = gen_palette(factor);
    var channels = [0, 1, 2]; //Canales RGB
    for (var y = 0; y < image.height; y += 1) {
      for (var x = 0; x < image.width; x += 1) {
        channels.forEach(c => {
          old_pixel = getPixel(x, y, image, c);
          new_pixel = find_closest_palette_color(old_pixel, palette);
  
          setPixel(x, y, image, new_pixel, c);
  
          quant_error = old_pixel - new_pixel;
  
          setPixel(x+1, y  , image, getPixel(x+1, y  , image, c) + quant_error * 7 / 48, c);
          setPixel(x+2, y  , image, getPixel(x+2, y  , image, c) + quant_error * 5 / 48, c);

          setPixel(x-2, y+1, image, getPixel(x-2, y+1, image, c) + quant_error * 3 / 48, c);
          setPixel(x-1, y+1, image, getPixel(x-1, y+1, image, c) + quant_error * 5 / 48, c);
          setPixel(x  , y+1, image, getPixel(x  , y+1, image, c) + quant_error * 7 / 48, c);
          setPixel(x+1, y+1, image, getPixel(x+1, y+1, image, c) + quant_error * 5 / 48, c);
          setPixel(x+2, y+1, image, getPixel(x+2, y+1, image, c) + quant_error * 3 / 48, c);

          setPixel(x-2, y+2, image, getPixel(x-2, y+2, image, c) + quant_error * 1 / 48, c);
          setPixel(x-1, y+2, image, getPixel(x-1, y+2, image, c) + quant_error * 3 / 48, c);
          setPixel(x  , y+2, image, getPixel(x  , y+2, image, c) + quant_error * 5 / 48, c);
          setPixel(x+1, y+2, image, getPixel(x+1, y+2, image, c) + quant_error * 3 / 48, c);
          setPixel(x+2, y+2, image, getPixel(x+2, y+2, image, c) + quant_error * 1 / 48, c);

        });
      }
    }
  }
  
  // Imágenes a restar (imageA y imageB) y el retorno en result
  function substraction(imageA,imageB,result) {
    var channels = [0, 1, 2]; //Canales RGB
    for (var y = 0; y < imageA.height; y += 1) {
      for (var x = 0; x < imageA.width; x += 1) {
        channels.forEach(c => {
          setPixel(x, y, result, getPixel(x, y, imageA, c) - getPixel(x, y, imageB, c), c);
        });
      }
    }
  }
  
  function gen_palette(factor) {
    var step = Math.ceil(256/factor);
    var palette = [];
    for (var c = 0; c < 255; c += step) {
      palette.push(c);
    }
    palette.push(255);
    return palette;
  }
  
  function find_closest_palette_color(value, palette) {
    for (var i = 0; value >= palette[i]; i += 1) {
    }
    return Math.abs(value-palette[i]) < Math.abs(value-palette[i-1]) ? palette[i] : palette[i-1];
  }
  
  function getIndex(x, y, image) {
    return (y * (image.width * 4) + x * 4);
  }
  
  function getPixel(x, y, image, channel) {
    return image.data[getIndex(x, y, image) + channel];
  }
  
  function setPixel(x, y, image, value, channel) {
    image.data[getIndex(x, y, image) + channel] = value;
  }
  