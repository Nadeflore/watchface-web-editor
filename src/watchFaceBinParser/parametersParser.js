/**
 * This file contains functions used to read parameters found in watchface bin filess
 */
import { parseModule } from 'esprima';
import { validate_each_argument } from 'svelte/internal';
import parametersDescription from './parametersDescription.json'

/**
 * Read binary parameters structure
 * 
 * @param {Uint8Array} byteArray An Uint8Array containing parameters
 * @returns {object} An object containing the data
 */
 export function parseParams(byteArray) {
	let result = {}
	let offset = 0
	
	// Read each key value pair, until the end of array
	do {
		// First value is a descriptor containing key and `hasChildren` flag
		const [fieldDescriptor, keySize] = readVariableWidthValue(byteArray.subarray(offset))
		const key = fieldDescriptor >> 3
		const hasChildren = fieldDescriptor & 0x02

		if (key === 0) {
			throw new Error(`Invalid key of 0 found found at offset ${offset}`)
		}

		offset += keySize

		// From the second byte on is the value
		let [fieldValue, valueSize] = readVariableWidthValue(byteArray.subarray(offset))
		
		offset += valueSize
		
		if (hasChildren) {
			// When node has children, field value is size of children
			const childrenSize = fieldValue
			if (childrenSize <= 0) {
				throw new Error("Children size of 0 or less")
			}
			// Recursive call to read children data
			fieldValue = parseParams(byteArray.subarray(offset, offset + childrenSize))
			offset += childrenSize
		}
		
		if (key in result) {
			// duplicate key, it's a list ?
			if (!Array.isArray(result[key])) {
				result[key] = [result[key]]
			}
			result[key].push(fieldValue)
		} else {
			result[key] = fieldValue
		}
	} while (offset < byteArray.length);
	
	return result
}


/**
 * Read variable width value from a byte array
 *
 * For each byte:
 * The msb indicates if this is the last byte (0), or if data continues on the next byte (1).
 * The 7 remaining bits are the actual data (lsb first, little endian style)
 * 
 * The value is interpreted as a signed 64 bit integer
 * Because javascript number type is a 64 bit float, values bigger than 9e15 may not be represented accurately
 * BigInt could be returned, but a value that big is likely never needed
 * @param {Uint8Array} byteArray An Uint8Array containing variable width value
 * @returns {[number, number]} An Array with :
 *          - the value
 *          - number of bytes read from array (used to encode this value)
 */
 export function readVariableWidthValue(byteArray) {
	let value = BigInt(0)
	for (var i=0; i<10; i++) { // Up to a maximum of 10 bytes (Number of byte needed to represent 64 bit values (10 * 7 > 64)
		const byte = byteArray[i]

		value |= BigInt(byte & 0x7f) << BigInt(i*7)

		if (!(byte & 0x80)) {
			break // this is the last chunk of data
		}
	}
	return [Number(BigInt.asIntN(64, value)), i + 1]
}


/**
 * Convert parameters ids to human readable names
 * @param {object} parameters A parameters object containing ids as keys
 * @returns {object} A copy of the paramters object with ids replaced by names
 */
export function convertParametersIdsToHumanReadableName(parameters) {
	const converter = new ParametersNameConverter(parametersDescription)
	return converter.convertIdToName(parameters)
}

class ParametersNameConverter {
	constructor(parametersDescription) {
		// Convert params description and types, to be used while converting ids to name
		this.parametersDescriptionFromId = this.convertParametersDescriptionToIdAsKey(parametersDescription.parameters)
		this.parametersTypesDescriptionFromId = {}
		for (const [key, value] of Object.entries(parametersDescription.types)) {
			this.parametersTypesDescriptionFromId[key] = this.convertParametersDescriptionToIdAsKey(value)
		}
	}

	// Convert description "id:name": type to "id": {name: "name", type: type}
	// to be used to convert from id to name
    convertParametersDescriptionToIdAsKey(description) {
		// Base case
		if (typeof description !== "object") {
			return description
		}
		
		const result = {}
		for (const [key, value] of Object.entries(description)) {
			if (!key.includes(":")) {
				throw new Error(`Parameter description is invalid : ${key}`)
			}
			const [id, name] = key.split(":")
			result[id] = {name, type: this.convertParametersDescriptionToIdAsKey(value)}
		}
		
		return result
	}

	/**
	 * Convert parameters ids to human readable names using the provided parameters description
	 * @param {object|object[]} parameters A parameters object containing ids as keys, or an Array of parameters object
	 * @param {object} parametersDescription Optional, if falsy, will use the root parameters description
	 * @returns {object|object[]} A copy of the paramters object with ids replaced by names
	 */
	convertIdToName(parametersList, parametersDescription) {
		if (!parametersDescription) {
			parametersDescription = this.parametersDescriptionFromId
		}

		let result = []

		// Pack to list if not a list
		if (!Array.isArray(parametersList)) {
			parametersList = [parametersList]
		}

		for (const parameters of parametersList) {
			// Base case
			if (typeof parameters !== "object") {
				return formatParameterValue(parameters, parametersDescription)
			}
			
			if (typeof parametersDescription !== "object") {
				console.log(parametersDescription)
				throw new Error("Parameter description does not match parameter")
			}
			
			const object = {}
			for (const [key, value] of Object.entries(parameters)) {
				// Unknown parameter name, leave untouched
				if (!(key in parametersDescription)) {
					console.warn(`Unknown parameter: ${key}`)
					object[key] = value
					continue
				}
				let {name, type} = parametersDescription[key]
				
				// If a generic type is referenced
				if (typeof type !== "object" && type in this.parametersTypesDescriptionFromId) {
					type = this.parametersTypesDescriptionFromId[type]
				}
				
				object[name] = this.convertIdToName(value, type)
			}

			result.push(object)
		}
		
		// Unpack if only 1 object
		if (result.length === 1) {
			result = result[0]
		}
		return result
	}
}

/**
 * Format value based on type
 * @param {number} value A signed integer value
 * @param {String} type A string containing the type name
 * @returns the correct representation for the given type
 * @throws Error When type is unknow
 */
export function formatParameterValue(value, type) {
	switch(type) {
		case "int":
		case "imgid":
			return value

		case "bool":
			return !!value

		case "alignment":
			const horizontalAlignment = {"2": "Left", "4": "Right", "8": "Center"}
			const verticalAlignment = {"16": "Top", "32": "Bottom", "64": "Center"}
			return (verticalAlignment[value & 0xF0] || "") + (horizontalAlignment[value & 0x0F] || "")

		case "color":
			return "0x" + value.toString(16).toUpperCase()

		default:
			throw new Error(`Unknown type: ${type}`)
	}

	
}