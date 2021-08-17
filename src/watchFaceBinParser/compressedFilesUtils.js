

export function uncompressFile(dataBuffer, startOffset = 0) {
    const dataView = new DataView(dataBuffer)
    let result = []

    // copy uncompressed bytes before compression starts
    for (let i = 0; i < startOffset; i++) {
        result.push(dataView.getUint8(i))
    }

    let endOfChunk = startOffset
    let offset = startOffset

    // while a new chunk is found
    while (offset < dataView.byteLength && dataView.getUint8(offset) === 0x4F) {
        endOfChunk += dataView.getUint16(offset + 1, true)
        offset += 9
        // While the chunk is not finished
        while (offset < endOfChunk) {

            // read 32bit descritor indicating litterals(0) or length-distance pair(1)
            let descriptor = dataView.getUint32(offset, true)
            if (!(descriptor & 0x80000000)) {
                throw Error("Unexpected descriptor")
            }
            offset += 4
            for (let i = 0; i < 31; i++) {
                if ((descriptor >> i) & 0x00000001) {
                    // length-distance pair
                    let length, distance

                    const firstByte = dataView.getUint8(offset)
                    if ((firstByte & 0x03) === 0) {
                        // one byte (distance (6bits) + 2bits)
                        length = 3
                        distance = dataView.getUint8(offset) >> 2
                        offset++
                    } else if ((firstByte & 0x03) === 1) {
                        // two bytes (distance (14bits)  + 2bits)
                        length = 3
                        distance = dataView.getUint16(offset, true) >> 2
                        offset += 2
                    } else if ((firstByte & 0x03) === 2) {
                        // two bytes (distance (10bits) + length (4bits) + 2bits)
                        const pair = dataView.getUint16(offset, true)
                        offset += 2
                        length = ((pair & 0x003C) >> 2) + 3
                        distance = pair >> 6
                    } else if ((firstByte & 0x7F) === 3) {
                        // four bytes (distance (17bits) + length (8bits) + 7bits)
                        const pair = dataView.getUint32(offset, true)
                        offset += 4
                        length = ((pair & 0x7F80) >> 7) + 3
                        distance = pair >> 15
                    } else {
                        // three bytes (distance (17bits) + length (5bits) + 2bits)
                        const pair = dataView.getUint32(offset, true) & 0x00FFFFFF
                        offset += 3
                        length = ((pair & 0x007C) >> 2) + 2
                        distance = pair >> 7
                    }

                    // copy repeated data to result
                    for (let j = 0; j < length; j++) {
                        result.push(result[result.length - distance])
                    }
                } else {
                    // Literal byte
                    result.push(dataView.getUint8(offset))
                    offset++
                }

                if (offset >= endOfChunk) {
                    break
                }

            }
        }

    }

    // The rest of the file is not compressed
    for (; offset < dataView.byteLength; offset++) {
        result.push(dataView.getUint8(offset))
    }

    return result
}