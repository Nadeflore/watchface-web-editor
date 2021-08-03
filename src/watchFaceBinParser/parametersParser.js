/**
 * This file contains functions used to read parameters found in watchface bin filess
 */
import { parseModule } from 'esprima';
import { validate_each_argument } from 'svelte/internal';

/**
 * Read binary parameters structure
 * 
 * @param {Uint8Array} byteArray An Uint8Array containing parameters
 * @returns {object} An object containing the data
 */
export function parseParameters(byteArray) {
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
			fieldValue = parseParameters(byteArray.subarray(offset, offset + childrenSize))
			offset += childrenSize
		}

		if (key in result) {
			// duplicate key, it's a list
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
 * 
 * @param {object} parameters An object with integers as keys and values
 * @returns {Uint8Array} Binary representation
 */
export function writeParameters(parameters) {
	const result = []
	for (let [key, valueOrList] of Object.entries(parameters)) {
		// In case the value is a list, write multiple values with same key
		for (const value of Array.isArray(valueOrList) ? valueOrList : [valueOrList]) {
			// base case
			if (typeof value === "number") {
				// write key
				result.push(...writeVariableWidthValue(key << 3))
				// write value
				result.push(...writeVariableWidthValue(value))
			} else if (Array.isArray(value) || typeof value === "object") {
				// recursive call for children
				const children = writeParameters(value)
				// write key
				result.push(...writeVariableWidthValue((key << 3) | 0x02))
				// write children size
				result.push(...writeVariableWidthValue(children.length))
				// write children
				result.push(...children)
			} else {
				throw Error("Value is invalid")
			}
		}
	}

	return new Uint8Array(result)
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
	for (var i = 0; i < 10; i++) { // Up to a maximum of 10 bytes (Number of byte needed to represent 64 bit values (10 * 7 > 64)
		const byte = byteArray[i]

		value |= BigInt(byte & 0x7f) << BigInt(i * 7)

		if (!(byte & 0x80)) {
			break // this is the last chunk of data
		}
	}
	return [Number(BigInt.asIntN(64, value)), i + 1]
}

/**
 * 
 * @param {number} value The value to encode
 * @returns {Uint8Array} An array containing the encoded value
 */
export function writeVariableWidthValue(value) {
	const result = []
	let value64bit = BigInt.asUintN(64, BigInt(value))

	for (var i = 0; i < 10; i++) { // Up to a maximum of 10 bytes (Number of byte needed to represent 64 bit values (10 * 7 > 64)
		// Read lower 7 bits of value
		let byte = Number(value64bit & 0x7Fn)

		value64bit = value64bit >> 7n

		// If no data left after this byte, we can stop
		if (!value64bit) {
			result.push(byte)
			break
		}
		// Add byte with flag meaning the data continues in the next byte
		result.push(byte | 0x80)
	}

	return new Uint8Array(result)
}


/**
 * Convert parameters ids to human readable names
 * @param {object} parameters A parameters object containing ids as keys
 * @param {object} fileStructureInfo A file structure descriptor containing the description of the params
 * @returns {object} A copy of the parameters object with ids replaced by names
 */
export function convertIdsToNames(parameters, fileStructureInfo) {
	const converter = new ParametersNameConverter(fileStructureInfo)
	return converter.convertIdToName(parameters)
}

/**
 * Convert human readable names to parameters ids
 * @param {object} parameters A parameters object containing names as keys
 * @param {object} fileStructureInfo  A file structure descriptor containing the description of the params
 * @returns {object} A copy of the parameters object with names replaced by ids
 */
export function convertNamesToIds(parameters, fileStructureInfo) {
	const converter = new ParametersNameConverter(fileStructureInfo)
	return converter.convertNameToId(parameters)
}

class ParametersNameConverter {
	constructor(parametersDescription) {
		// Convert parameters description and types, to be used while converting ids to name
		this.parametersDescriptionFromId = this.convertParametersDescriptionToIdAsKey(parametersDescription.parameters)
		this.parametersDescriptionFromName = this.convertParametersDescriptionToNameAsKey(parametersDescription.parameters)
		this.parametersTypesDescriptionFromId = {}
		this.parametersTypesDescriptionFromName = {}
		for (const [key, value] of Object.entries(parametersDescription.types)) {
			this.parametersTypesDescriptionFromId[key] = this.convertParametersDescriptionToIdAsKey(value)
			this.parametersTypesDescriptionFromName[key] = this.convertParametersDescriptionToNameAsKey(value)
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
			result[id] = { name, type: this.convertParametersDescriptionToIdAsKey(value) }
		}

		return result
	}

	// Convert description "id:name": type to "name": {id: "id", type: type}
	// to be used to convert from name to id
	convertParametersDescriptionToNameAsKey(description) {
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
			result[name] = { id, type: this.convertParametersDescriptionToNameAsKey(value) }
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

		// Base case
		if (typeof parametersList === "number") {
			if (typeof parametersDescription === "object") {
				console.warn("Expected object, but got literal")
				return parametersList
			}
			return formatParameterValue(parametersList, parametersDescription)
		}

		if (typeof parametersDescription !== "object") {
			console.log(parametersDescription)
			throw new Error("Parameter description does not match parameter")
		}

		let result = []

		// Pack to list if not a list
		if (!Array.isArray(parametersList)) {
			parametersList = [parametersList]
		}

		for (const parameters of parametersList) {
			const object = {}
			for (const [key, value] of Object.entries(parameters)) {
				// Unknown parameter name, leave untouched
				if (!(key in parametersDescription)) {
					console.warn(`Unknown parameter: ${key}`)
					object[key] = value
					continue
				}
				let { name, type } = parametersDescription[key]

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

	/**
 * Convert parameters human readable names to ids using the provided parameters description
 * @param {object|object[]} parameters A parameters object containing name as keys, or an Array of parameters object
 * @param {object} parametersDescription Optional, if falsy, will use the root parameters description
 * @returns {object|object[]} A copy of the paramters object with name replaced by ids
 */
	convertNameToId(parametersList, parametersDescription) {
		if (!parametersDescription) {
			parametersDescription = this.parametersDescriptionFromName
		}

		// Base case
		if (typeof parametersList !== "object" && !Array.isArray(parametersList)) {
			return parseParameterValue(parametersList, parametersDescription)
		}

		if (typeof parametersDescription !== "object") {
			console.log(parametersDescription)
			throw new Error("Parameter description does not match parameter")
		}

		let result = []

		// Pack to list if not a list
		if (!Array.isArray(parametersList)) {
			parametersList = [parametersList]
		}

		for (const parameters of parametersList) {
			const object = {}
			for (const [key, value] of Object.entries(parameters)) {
				if (!(key in parametersDescription)) {
					if (isNaN(key)) {
						// if key is not in description and is not a number, nothing we can do about it
						throw new Error(`Unknown key ${key}, expected one of the folowing : ${Object.keys(parametersDescription)}`)
					}

					console.warn(`Not converted, already an id: ${key}`)
					object[key] = value
					continue
				}
				let { id, type } = parametersDescription[key]

				// If a generic type is referenced
				if (typeof type !== "object" && type in this.parametersTypesDescriptionFromName) {
					type = this.parametersTypesDescriptionFromName[type]
				}

				object[id] = this.convertNameToId(value, type)
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


const alignmentValues = [
	{ value: 2, name: "Left" },
	{ value: 4, name: "Right" },
	{ value: 8, name: "HCenter" },
	{ value: 16, name: "Top" },
	{ value: 32, name: "Bottom" },
	{ value: 64, name: "VCenter" },
	{ value: 18, name: "TopLeft" },
	{ value: 34, name: "BottomLeft" },
	{ value: 66, name: "CenterLeft" },
	{ value: 20, name: "TopRight" },
	{ value: 36, name: "BottomRight" },
	{ value: 68, name: "CenterRight" },
	{ value: 24, name: "TopCenter" },
	{ value: 40, name: "BottomCenter" },
	{ value: 72, name: "Center" }
]


/**
 * Format value based on type
 * @param {number} value A signed integer value
 * @param {string} type A string containing the type name
 * @returns {number|string} the correct representation for the given type
 * @throws Error When type is unknow
 */
export function formatParameterValue(value, type) {
	switch (type) {
		case "int":
		case "imgid":
			return value

		case "bool":
			return !!value

		case "alignment":
			return alignmentValues.find(e => e.value === value).name

		case "color":
			return "0x" + value.toString(16).toUpperCase()

		default:
			throw new Error(`Unknown type: ${type}`)
	}
}

/**
 * Parse value base on type
 * @param {number|string} representation A representation of the data type
 * @param {string} type A string containing the type name
 * @returns {number} A signed integer representing the value
 */
export function parseParameterValue(representation, type) {
	switch (type) {
		case "int":
		case "imgid":
			return representation

		case "bool":
			return +representation

		case "alignment":
			return alignmentValues.find(e => e.name === representation).value

		case "color":
			return parseInt(representation.match(/0x([\da-f]+)/i)[1], 16)

		default:
			throw new Error(`Unknown type: ${type}`)
	}
}