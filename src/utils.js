
/**
 * Initiate of a file download containing the given content
 * @param {ArrayBufferView|Blob} fileContent
 * @param {string} mimeType 
 * @param {string} filename 
 */
export function startFileDownload(fileContent, mimeType, filename) {
  // Generate file url
  if (typeof fileContent !== 'Blob') {
    fileContent = new Blob([fileContent], { type: mimeType });
  }
  const href = window.URL.createObjectURL(fileContent);

  // Create file link tag
  var link = document.createElement('a');
  link.setAttribute('download', filename);
  link.href = href;
  document.body.appendChild(link);

  // wait for the link to be added to the document
  window.requestAnimationFrame(function () {
    // generate click event on link
    var event = new MouseEvent('click');
    link.dispatchEvent(event);
    // remove link
    document.body.removeChild(link);
  });

}

/**
 * Convert pixels buffer to a png image
 * @param {{pixels: Uint8Array, width: number, height: number}} image 
 * @returns {string} Data url of the png image
 */
export function convertImagePixelsToPngDataUrl(image) {
  // create a canvas to hold the image
  const canvas = document.createElement('canvas')
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(
    image.width,
    image.height
  );

  imageData.data.set(image.pixels)
  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL("img/png")
}

/**
 * Convert a dataUrl of an image to pixels data
 * @param {string} imgDataUrl 
 * @param {{width: number, height: number}} maxSize When given, the image will be resized if bigger than the specified size
 * @returns {{pixels: Uint8Array, width: number, height: number}}
 */
export function convertDataUrlToImagePixels(imgDataUrl, maxSize = undefined) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function () {
      let width = this.width;
      let height = this.height;
      if (maxSize && (width > maxSize.width || height > maxSize.height)) {
        ({ width, height } = computeSizeToFitArea(width, height, maxSize.width, maxSize.height))
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.imageSmoothingQuality = "high"
      context.drawImage(this, 0, 0, width, height);
      const pixels = context.getImageData(
        0,
        0,
        width,
        height
      ).data;
      resolve({
        pixels,
        height: height,
        width: width,
      });
    };
    img.onerror = function (e) { reject("Unable to read image") };
    img.src = imgDataUrl;
  })
}

export function resizeImage(image, newWidth, newHeight) {
  const canvas = document.createElement("canvas");
  canvas.width = newWidth;
  canvas.height = newHeight;
  const context = canvas.getContext("2d");
  context.drawImage(this, 0, 0);
  const pixels = context.getImageData(
    0,
    0,
    newWidth,
    newHeight
  ).data;
  return {
    pixels,
    width: newWidth,
    height: newHeight,
  }
}

/**
 * Remove prefix from dataUrl to get only base64 data
 * @param {string} dataUrl 
 * @returns {string} the base64 part of the dataUrl
 */
export function removePrefixFromDataUrl(dataUrl) {
  var idx = dataUrl.indexOf('base64,') + 'base64,'.length
  return dataUrl.substring(idx)
}

/**
 * Return the size to set to the image to fit the area without cropping, and while keeping the image aspect ratio
 * @param {number} imageWidth 
 * @param {number} imageHeight 
 * @param {number} areaWidth 
 * @param {number} areaHeight 
 * @returns {{width: {number}, height: {number}}}
 */
export function computeSizeToFitArea(imageWidth, imageHeight, areaWidth, areaHeight) {
  // Compute aspect ratio of image, and of fit
  const imageAspectRatio = imageWidth / imageHeight
  const areaAspectRatio = areaWidth / areaHeight

  if (imageAspectRatio > areaAspectRatio) {
    // image is wider
    return { width: areaWidth, height: Math.round(areaWidth / imageAspectRatio) }
  } else {
    // image is taller
    return { width: Math.round(areaHeight * imageAspectRatio), height: areaHeight }
  }
}