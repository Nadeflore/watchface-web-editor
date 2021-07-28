import { parseParameters, writeParameters, convertIdsToNames, convertNamesToIds } from './parametersParser'
import { parseImage, writeImage } from './imageParser'

const HEADER_SIZE = 0x57;


/**
 * Parse a watchface bin file parameters and images
 * @param {ArrayBuffer} buffer An arrayBuffer of a watchface bin file
 * @returns {{parameters: object, images: object[]}} An object containing the parameters and images found in the file
 */
export function parseWatchFaceBin(buffer) {
    let offset = 0;
				
    // Read header
    const header = new DataView(buffer, offset, HEADER_SIZE)
    // Offset is now at parametersInfo
    offset += HEADER_SIZE

    // Check signature
    if (header.getUint32(0, false) !== 0x55494848) {
        throw new Error(`Invalid signature`)
    }

    const parametersInfoSize = header.getUint32(HEADER_SIZE - 0x4, true)
    
    console.debug("Read parameters info")
    // Read parameters info
    const parametersInfo = parseParameters(new Uint8Array(buffer, offset, parametersInfoSize))
    
    // Offset is now at parameters
    offset += parametersInfoSize
    
    // First parameter info contains parameters size and images count
    const parametersSize = parametersInfo["1"]["1"]
    const imagesCount = parametersInfo["1"]["2"]
    delete parametersInfo["1"]
    
    // Other parameter info contain location of each parameters
    const parameters = {}
    for (const [key, value] of Object.entries(parametersInfo)) {
        console.debug(`Read parameter ${key}`)
        const parameterOffset = value["1"]
        const parameterSize = value["2"]
        parameters[key] = parseParameters(new Uint8Array(buffer, offset + parameterOffset, parameterSize))
    }
    
    // convert parameter ids to readable names
    const parametersWithName = convertIdsToNames(parameters)
    // Offset is now at images info
    offset += parametersSize
    
    const imagesInfoSize = 4 * imagesCount
    const imagesInfo = new DataView(buffer, offset, imagesInfoSize)
    
    // Offset is now at images
    offset += imagesInfoSize
    
    // Load each image 
    const images = []
    for (let i=0; i< imagesCount; i++) {
        const imageOffset = imagesInfo.getUint32(i*4, true)
        images.push(parseImage(buffer.slice(offset + imageOffset)))
    }

    return {parameters: parametersWithName, images}
}

/**
 * Write a watchface bin file parameters and images
 * 
 * @param {object} parameters parameters object with name as key
 * @param {object[]} images list of resource images to include
 * @returns {Uint8Array} The binary data of the resulting watchface file
 */
export function writeWatchFaceBin(parametersWithNames, images) {
    // Convert parameters names to ids
    const parametersWithIds = convertNamesToIds(parametersWithNames)


    // Encode all the parameters
    const parametersInfo = {"1": {"1": 0, "2": images.length}}
    const binaryParameters = []

    for (const [key, value] of Object.entries(parametersWithIds)) {
        // Encode parameter to binary
        const binaryParameter = writeParameters(value)
        // write postion and offset in parameters info
        parametersInfo[key] = {"1": binaryParameters.length, "2": binaryParameter.length}
        // write actual parameter
        binaryParameters.push(...binaryParameter)
    }

    // write parameters size in param info
    parametersInfo["1"]["1"] = binaryParameters.length

    // Encode parameters info
    const binaryParametersInfo = writeParameters(parametersInfo)

    const binaryImagesInfo = new Uint8Array(images.length * 4)
    const binaryImagesInfoView = new DataView(binaryImagesInfo.buffer)
    const binaryImages = []

    // Encode each image
    for (const [i, image] of images.entries()) {
        // write offset of image in image info
        binaryImagesInfoView.setUint32(i * 4, binaryImages.length, true)
        // convert image to bitmap file
        const binaryImage = new Uint8Array(writeImage(image.pixels, image.width, image.height))

        binaryImages.push(...binaryImage)
    }

    // Create buffer to hold file data
    const result = new Uint8Array(HEADER_SIZE + binaryParametersInfo.length + binaryParameters.length + binaryImagesInfo.length + binaryImages.length)
    const resultView = new DataView(result.buffer)

    // write header
    result.set([
        0x55, 0x49, 0x48, 0x48,
        0x01, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01, 0xb5, 0xe5, 0x3d, 0x00, 0x3d, 0x00, 0x30, 0x27,
        0x00, 0x00, 0xab, 0x86, 0x09, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x4d, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ], 0)
    // Set parameters info size
    resultView.setUint32(HEADER_SIZE - 0x4, binaryParametersInfo.length, true)

    // add parameters info
    result.set(binaryParametersInfo, HEADER_SIZE)

    // add parameters
    result.set(binaryParameters, HEADER_SIZE + binaryParametersInfo.length)

    // add images info
    result.set(binaryImagesInfo, HEADER_SIZE + binaryParametersInfo.length + binaryParameters.length)

    //add images 
    result.set(binaryImages, HEADER_SIZE + binaryParametersInfo.length + binaryParameters.length + binaryImagesInfo.length)


    return result
}