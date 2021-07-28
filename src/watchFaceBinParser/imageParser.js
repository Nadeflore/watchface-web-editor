/**
 * This file contains functions used to parse images found in watchface bin files
 */

 const HEADER_SIZE = 16

/**
 * 
 * @param {ArrayBuffer} dataBuffer Binary data of a bitmap image
 * @returns {{width: number, height: number, pixels: Uint8ClampedArray, bitsPerPixel: number}} Object containing width height and pixel data in rgba form
 */
 export function parseImage(dataBuffer) {
    const dataView = new DataView(dataBuffer)
	// Check signature
	if (! (dataView.getUint8(0) === 0x42 && dataView.getUint8(1) === 0x4D)) {
		throw new Error("Invalid image signature")
	}
	
	// read header
	const pixelFormat = dataView.getUint16(2, true)
	const width = dataView.getUint16(4, true)
	const height = dataView.getUint16(6, true)
	const rowSize = dataView.getUint16(8, true)
	const bitsPerPixel = dataView.getUint16(10, true)
	const paletteColorsCount = dataView.getUint16(12, true)
	const transparentPaletteColor = dataView.getUint16(14, true)
	
	if (!([16, 24, 32].includes(bitsPerPixel) && paletteColorsCount === 0 && [0x08, 0x13, 0x1B, 0x1C, 0x10, 0x09].includes(pixelFormat)) && !([4, 8].includes(bitsPerPixel) && paletteColorsCount > 0 && pixelFormat === 0x64)) {
		throw new Error(`Unsuported pixel format/color depth/Palette (should add support) ${pixelFormat.toString(16)} ${bitsPerPixel}  ${paletteColorsCount}`)
	}

	if ((bitsPerPixel * width) / 8 !== rowSize) {
		throw new Error(`Row size is not as expected (Padding ?)`)
	}
	
	let paletteSize = 0
	let palette = []
	if (paletteColorsCount > 0) {
		// Read palette
		for (let i=0; i< paletteColorsCount; i++) {
			const color = {
				red: dataView.getUint8(HEADER_SIZE + i*4),
			  	green: dataView.getUint8(HEADER_SIZE + i*4 + 1),
				blue: dataView.getUint8(HEADER_SIZE + i*4 + 2),
				alpha: i === transparentPaletteColor - 1 ? 0xFF : 0x00
			}
			palette.push(color)
		}
		
		paletteSize = paletteColorsCount * 4
	}
	
	// Read pixel data
	const pixels = new Uint8ClampedArray(4 * width * height);
	for (let i=0; i< width * height; i++) {
		// read pixel color info
		let red;
		let green;
		let blue;
		let alpha = 0x00
		if (paletteColorsCount) {
			let colorId
			if (bitsPerPixel === 4){ 
				const byte = dataView.getUint8(HEADER_SIZE + paletteSize + Math.floor(i/2))
				if (i % 2) {
					colorId = byte & 0x0F;
				} else {
					colorId = (byte & 0xF0) >> 4;
				}
			} else {
				colorId = dataView.getUint8(HEADER_SIZE + paletteSize + i)
			}
			const color =  palette[colorId]
			red = color.red
			green = color.green
			blue = color.blue
			alpha = color.alpha
		} else {
			const bytePerPixel = bitsPerPixel / 8
			if (bytePerPixel === 4) {
				red = dataView.getUint8(HEADER_SIZE + i*bytePerPixel + 0)
				green = dataView.getUint8(HEADER_SIZE + i*bytePerPixel + 1)
				blue = dataView.getUint8(HEADER_SIZE + i*bytePerPixel + 2)
				alpha = dataView.getUint8(HEADER_SIZE + i*bytePerPixel + 3)
			} else {
				let rgba
				if (bytePerPixel === 3) {
					// 24 bits is 16 bit color data (big endian) with 8 bit alpha
					alpha = dataView.getUint8(HEADER_SIZE + i*bytePerPixel)
					rgba = dataView.getUint16(HEADER_SIZE + i*bytePerPixel + 1, false)
				} else {
					// for the 16 bit images, the value is little endian
					rgba = dataView.getUint16(HEADER_SIZE + i*bytePerPixel, true)
				}
				if (pixelFormat === 0x13) {
					// color is 16 bit (4:4:4:4) abgr
					alpha = (rgba & 0xF000) >> 8
					blue = (rgba & 0x0F00) >> 4
					green = (rgba & 0x00F0)
					red = (rgba & 0x000F) << 4
				} else if (pixelFormat === 0x1C || pixelFormat === 0x09) {
					// color is 16bit (5:6:5) rgb
					red = (rgba & 0xF800) >> 8
					green = (rgba & 0x07E0) >> 3
					blue = (rgba & 0x001F) << 3
				} else {
					// color is 16bit (5:6:5) bgr
					blue = (rgba & 0xF800) >> 8
					green = (rgba & 0x07E0) >> 3
					red = (rgba & 0x001F) << 3
				}
			}
		}
		
		pixels[i*4] = red
		pixels[i*4 + 1] = green
		pixels[i*4 + 2] = blue
		// Alpha is inverted, 0xFF is transparent
		pixels[i*4 + 3] = 0xFF - alpha
	}
	
	return {pixels, width, height, bitsPerPixel, pixelFormat}
}

/**
 * 
 * @param {Uint8ClampedArray} pixels Pixels data in rgba format
 * @param {number} width 
 * @param {number} height 
 * @returns {ArrayBuffer} The resulting bitmap file data
 */
export function writeImage(pixels, width, height) {
	const bitsPerPixel = 24
	const bytePerPixel = bitsPerPixel / 8

	// Size needed for this image
	const bufferSize = HEADER_SIZE + (bitsPerPixel * width * height) / 8

	const buffer = new ArrayBuffer(bufferSize)
	const dataView = new DataView(buffer)

	// write header
	dataView.setUint8(0, 0x42)
	dataView.setUint8(1, 0x4D)
	dataView.setUint16(2, 0x1B, true)
	dataView.setUint16(4, width, true)
	dataView.setUint16(6, height, true)
	dataView.setUint16(8, (width * bitsPerPixel) / 8, true)
	dataView.setUint16(10, bitsPerPixel, true)
	dataView.setUint16(12, 0, true)
	dataView.setUint16(14, 0, true)

	// write pixel data
	for (let i=0; i< width * height; i++) {
		const red = pixels[i*4]
		const green = pixels[i*4 + 1]
		const blue = pixels[i*4 + 2]
		const alpha = 0xFF - pixels[i*4 + 3]

		// write alpha
		dataView.setUint8(HEADER_SIZE + i*bytePerPixel, alpha)

		// color is 16bit (5:6:5) bgr
		let rgb = 0
		rgb |= (blue & 0xF8) << 8
		rgb |= (green & 0xFC) << 3
		rgb |= (red & 0xF8) >> 3

		dataView.setUint16(HEADER_SIZE + i*bytePerPixel + 1, rgb, false)
	}

	return dataView.buffer
}