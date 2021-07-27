import { parseParams, convertParametersIdsToHumanReadableName } from './parametersParser'
import { parseImage } from './imageParser'

/**
 * Parse a watchface bin file parameters and images
 * @param {ArrayBuffer} buffer An arrayBuffer of a watchface bin file
 * @returns {{parameters: object, images: object[]}} And object containing the paramters and images found in the file
 */
export function parseWatchFaceBin(buffer) {
    let offset = 0;
				

    // Read header
    const headerSize = 0x57;
    const header = new DataView(buffer, offset, headerSize)
    // Offset is now at parametersInfo
    offset += headerSize

    // Check signature
    if (header.getUint32(0, false) !== 0x55494848) {
        throw new Error(`Invalid signature`)
    }

    const parametersInfoSize = header.getUint32(headerSize - 0x4, true)
    
    console.debug("Read parameters info")
    // Read parameters info
    const parametersInfo = parseParams(new Uint8Array(buffer, offset, parametersInfoSize))
    
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
        parameters[key] = parseParams(new Uint8Array(buffer, offset + parameterOffset, parameterSize))
    }
    
    // convert parameter ids to readable names
    const parametersWithName = convertParametersIdsToHumanReadableName(parameters)
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