import { parseParameters, writeParameters, convertIdsToNames, convertNamesToIds } from './parametersParser'
import { parseImage, writeImage } from './imageParser'

import UIHH from './models/fileTypes/UIHH.json'
import miband4 from './models/miband4.json'
import miband5 from './models/miband5.json'
import miband6 from './models/miband6.json'
import amazfitbip from './models/amazfitbip.json'
import amazfitbips from './models/amazfitbips.json'

const fileTypes = { UIHH }
const watchModelsDescriptor = [miband5, miband6, miband4, amazfitbip, amazfitbips]

export function getAvailableModels() {
    for (const model of watchModelsDescriptor) {
        if (typeof model.fileType === "string")
            // Replace file type name with actual fileType data
            model.fileType = fileTypes[model.fileType]
    }
    return watchModelsDescriptor
}

/**
 * Parse a watchface bin file parameters and images
 * @param {ArrayBuffer} buffer An arrayBuffer of a watchface bin file
 * @param {object} fileStructureInfo A file structure descriptor for this bin format
 * @returns {{parameters: object, images: object[]}} An object containing the parameters and images found in the file
 */
export function parseWatchFaceBin(buffer, fileStructureInfo) {
    const headerSize = fileStructureInfo.header.length
    let offset = 0;
    // Read header
    const header = new DataView(buffer, offset, headerSize)
    // Offset is now at parametersInfo
    offset += headerSize

    // Check signature
    const fileSignature = Array.from(new Uint8Array(buffer, 0, fileStructureInfo.signatureSize))
    const expectedSignature = fileStructureInfo.header.slice(0, fileStructureInfo.signatureSize)
    if (JSON.stringify(fileSignature) !== JSON.stringify(expectedSignature)) {
        throw new Error(`Invalid file signature, expected ${expectedSignature} but found ${fileSignature}`)
    }

    // Size of the biggest paramater
    // Parameters with a size bigger than this will be ignored by the watch
    const parameterBufferSize = header.getUint32(headerSize - 0x8, true)
    const parametersInfoSize = header.getUint32(headerSize - 0x4, true)

    console.debug(`Read parameters info ${parameterBufferSize}:${parametersInfoSize}`)
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
        const parameterOffset = value["1"]
        const parameterSize = value["2"]
        console.debug(`Read parameter ${key}, ${parameterOffset}:${parameterSize}`)
        parameters[key] = parseParameters(new Uint8Array(buffer, offset + parameterOffset, parameterSize))
    }


    // convert parameter ids to readable names
    const parametersWithName = convertIdsToNames(parameters, fileStructureInfo)
    // Offset is now at images info
    offset += parametersSize

    const imagesInfoSize = 4 * imagesCount
    const imagesInfo = new DataView(buffer, offset, imagesInfoSize)

    // Offset is now at images
    offset += imagesInfoSize

    // Load each image 
    const images = []
    for (let i = 0; i < imagesCount; i++) {
        const imageOffset = imagesInfo.getUint32(i * 4, true)
        images.push(parseImage(buffer.slice(offset + imageOffset)))
    }

    return { parameters: parametersWithName, images }
}

/**
 * Write a watchface bin file parameters and images
 * 
 * @param {object} parameters parameters object with name as key
 * @param {object[]} images list of resource images to include
 * @param {object} fileStructureInfo A file structure descriptor for this bin format
 * @returns {Uint8Array} The binary data of the resulting watchface file
 */
export function writeWatchFaceBin(parametersWithNames, images, fileStructureInfo) {
    // Convert parameters names to ids
    const parametersWithIds = convertNamesToIds(parametersWithNames, fileStructureInfo)

    // Encode all the parameters
    const parametersInfo = { "1": { "1": 0, "2": images.length } }
    const binaryParameters = []
    let maxParameterLength = 0

    for (const [key, value] of Object.entries(parametersWithIds)) {
        // Encode parameter to binary
        const binaryParameter = writeParameters(value)
        // write postion and offset in parameters info
        parametersInfo[key] = { "1": binaryParameters.length, "2": binaryParameter.length }
        // write actual parameter
        binaryParameters.push(...binaryParameter)

        if (binaryParameter.length > maxParameterLength) {
            maxParameterLength = binaryParameter.length
        }
    }

    // write parameters size in param info
    parametersInfo["1"]["1"] = binaryParameters.length

    // Encode parameters info
    const binaryParametersInfo = writeParameters(parametersInfo)

    const binaryImagesInfo = new Uint8Array(images.length * 4)
    const binaryImagesInfoView = new DataView(binaryImagesInfo.buffer)
    const binaryImages = []

    let imagesSize = 0
    // Encode each image
    for (const [i, image] of images.entries()) {
        // write offset of image in image info
        binaryImagesInfoView.setUint32(i * 4, imagesSize, true)
        // convert image to bitmap file
        const binaryImage = new Uint8Array(writeImage(image.pixels, image.width, image.height))

        binaryImages.push(binaryImage)
        imagesSize += binaryImage.length
    }

    const headerSize = fileStructureInfo.header.length

    // Create buffer to hold file data
    const result = new Uint8Array(headerSize + binaryParametersInfo.length + binaryParameters.length + binaryImagesInfo.length + imagesSize)
    const resultView = new DataView(result.buffer)

    // write header
    result.set(fileStructureInfo.header, 0)

    // Set parameters info size
    resultView.setUint32(headerSize - 0x8, maxParameterLength, true)
    resultView.setUint32(headerSize - 0x4, binaryParametersInfo.length, true)

    let offset = headerSize

    // add parameters info
    result.set(binaryParametersInfo, offset)
    offset += binaryParametersInfo.length

    // add parameters
    result.set(binaryParameters, offset)
    offset += binaryParameters.length

    // add images info
    result.set(binaryImagesInfo, offset)
    offset += binaryImagesInfo.length

    //add images
    for (const binaryImage of binaryImages) {
        result.set(binaryImage, offset)
        offset += binaryImage.length
    }
    return result
}