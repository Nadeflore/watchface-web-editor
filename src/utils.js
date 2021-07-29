
/**
 * Initiate of a file download containing the given content
 * @param {ArrayBufferView} fileContent 
 * @param {string} mimeType 
 * @param {string} filename 
 */
export function startFileDownload(fileContent, mimeType, filename) {
    // Generate file url
    var data = new Blob([fileContent], {type: mimeType});
    const href = window.URL.createObjectURL(data);
 
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
			return { width: areaWidth, height: areaWidth / imageAspectRatio }
		} else {
			// image is taller
			return { width: areaHeight * imageAspectRatio, height: areaHeight }
		}
}