import { readVariableWidthValue, writeVariableWidthValue, parseParameters, writeParameters, convertIdsToNames, convertNamesToIds, formatParameterValue, parseParameterValue } from './parametersParser'

describe('parseParameters()', () => {
    it('parse keys and values', () => {
        expect(parseParameters(Uint8Array.of(0x08, 0x04, 0x10, 0x6B))).toStrictEqual(
            {
                "1": 0x04,
                "2": 0x6B
            }
        )
    })
    it('parse nested structure', () => {
        expect(parseParameters(Uint8Array.of(0x0A, 0x05, 0x08, 0xBC, 0x04, 0x10, 0x6B))).toStrictEqual(
            {
                "1": {
                    "1": 0x023C,
                    "2": 0x6B
                }
            }
        )
    })
    it('parse lists', () => {
        expect(parseParameters(Uint8Array.of(0x08, 0x04, 0x08, 0x7F, 0x10, 0x6B))).toStrictEqual(
            {
                "1": [0x04, 0x7F],
                "2": 0x6B
            }
        )
    })
    it('parse multi byte id', () => {
        expect(parseParameters(Uint8Array.of(0x80, 0x02, 0x04))).toStrictEqual(
            {
                "32": 0x04
            }
        )
    })
})

describe('writeParameters()', () => {
    it('write keys and values', () => {
        expect(writeParameters(
            {
                "1": 0x04,
                "2": 0x6B
            }
        )).toStrictEqual(Uint8Array.of(0x08, 0x04, 0x10, 0x6B))
    })
    it('write nested structure', () => {
        expect(writeParameters(
            {
                "1": {
                    "1": 0x023C,
                    "2": 0x6B
                }
            }
        )).toStrictEqual(Uint8Array.of(0x0A, 0x05, 0x08, 0xBC, 0x04, 0x10, 0x6B))
    })
    it('write lists', () => {
        expect(writeParameters(
            {
                "1": [0x04, 0x7F],
                "2": 0x6B
            }
        )).toStrictEqual(Uint8Array.of(0x08, 0x04, 0x08, 0x7F, 0x10, 0x6B))
    })
    it('write multi byte id', () => {
        expect(writeParameters(
            {
                "32": 0x04
            }
        )).toStrictEqual(Uint8Array.of(0x80, 0x02, 0x04))
    })
})

describe('readVariableWidthValue()', () => {
    it('read single byte value', () => {
        expect(readVariableWidthValue(Uint8Array.of(0x73))).toStrictEqual([0x73, 1])
    })
    it('read multi byte value', () => {
        expect(readVariableWidthValue(Uint8Array.of(0xF3, 0x42))).toStrictEqual([0x2173, 2])
    })
    it('read negative values', () => {
        expect(readVariableWidthValue(Uint8Array.of(0xF3, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x01))).toStrictEqual([-13, 10])
    })
    it('read 31 bit value', () => {
        expect(readVariableWidthValue(Uint8Array.of(0x80, 0x80, 0x80, 0x80, 0x04))).toStrictEqual([1073741824, 5])
    })
    it('read 32 bit value', () => {
        expect(readVariableWidthValue(Uint8Array.of(0x80, 0x80, 0x80, 0x80, 0x08))).toStrictEqual([2147483648, 5])
    })
    it('read 33 bit value', () => {
        expect(readVariableWidthValue(Uint8Array.of(0x80, 0x80, 0x80, 0x80, 0x10))).toStrictEqual([4294967296, 5])
    })
})

describe('writeVariableWidthValue()', () => {
    it('write small value on one byte', () => {
        expect(writeVariableWidthValue(0x73)).toStrictEqual(Uint8Array.of(0x73))
    })
    it('write bigger values on multiple bytes', () => {
        expect(writeVariableWidthValue(0x2173)).toStrictEqual(Uint8Array.of(0xF3, 0x42))
    })
    it('write negative values', () => {
        expect(writeVariableWidthValue(-13)).toStrictEqual(Uint8Array.of(0xF3, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x01))
    })
    it('write 31 bit value', () => {
        expect(writeVariableWidthValue(1073741824)).toStrictEqual(Uint8Array.of(0x80, 0x80, 0x80, 0x80, 0x04))
    })
    it('write 32 bit value', () => {
        expect(writeVariableWidthValue(2147483648)).toStrictEqual(Uint8Array.of(0x80, 0x80, 0x80, 0x80, 0x08))
    })
    it('write 33 bit value', () => {
        expect(writeVariableWidthValue(4294967296)).toStrictEqual(Uint8Array.of(0x80, 0x80, 0x80, 0x80, 0x10))
    })
})

describe('convertIdsToNames()', () => {
    it('convert ids to names', () => {
        expect(convertIdsToNames(
            { "2": { "1": { "1": 0, "2": 0, "3": 0 } } }
        )).toStrictEqual(
            { "Background": { "Image": { "X": 0, "Y": 0, "ImageIndex": 0 } } }
        )
    })
    it('convert ids in lists', () => {
        expect(convertIdsToNames(
            { "2": { "1": [{ "1": 0, "2": 0, "3": 0 }, { "1": 0, "2": 0, "3": 1 }] } }
        )).toStrictEqual(
            { "Background": { "Image": [{ "X": 0, "Y": 0, "ImageIndex": 0 }, { "X": 0, "Y": 0, "ImageIndex": 1 }] } }
        )
    })
})

describe('convertNamesToIds()', () => {
    it('convert names to ids', () => {
        expect(convertNamesToIds(
            { "Background": { "Image": { "X": 0, "Y": 0, "ImageIndex": 0 } } }
        )).toStrictEqual(
            { "2": { "1": { "1": 0, "2": 0, "3": 0 } } }
        )
    })
    it('convert names in lists', () => {
        expect(convertNamesToIds(
            { "Background": { "Image": [{ "X": 0, "Y": 0, "ImageIndex": 0 }, { "X": 0, "Y": 0, "ImageIndex": 1 }] } }
        )).toStrictEqual(
            { "2": { "1": [{ "1": 0, "2": 0, "3": 0 }, { "1": 0, "2": 0, "3": 1 }] } }
        )
    })
})

describe('formatParameterValue()', () => {
    it('leave int and imgid as number', () => {
        expect(formatParameterValue(124, "imgid")).toStrictEqual(124)
        expect(formatParameterValue(-12, "int")).toStrictEqual(-12)
    })
    it('format boolean', () => {
        expect(formatParameterValue(0, "bool")).toStrictEqual(false)
        expect(formatParameterValue(1, "bool")).toStrictEqual(true)
    })
    it('format alignment', () => {
        expect(formatParameterValue(2, "alignment")).toStrictEqual("Left")
        expect(formatParameterValue(4, "alignment")).toStrictEqual("Right")
        expect(formatParameterValue(8, "alignment")).toStrictEqual("HCenter")
        expect(formatParameterValue(16, "alignment")).toStrictEqual("Top")
        expect(formatParameterValue(32, "alignment")).toStrictEqual("Bottom")
        expect(formatParameterValue(64, "alignment")).toStrictEqual("VCenter")
        expect(formatParameterValue(18, "alignment")).toStrictEqual("TopLeft")
        expect(formatParameterValue(34, "alignment")).toStrictEqual("BottomLeft")
        expect(formatParameterValue(66, "alignment")).toStrictEqual("CenterLeft")
        expect(formatParameterValue(20, "alignment")).toStrictEqual("TopRight")
        expect(formatParameterValue(36, "alignment")).toStrictEqual("BottomRight")
        expect(formatParameterValue(68, "alignment")).toStrictEqual("CenterRight")
        expect(formatParameterValue(24, "alignment")).toStrictEqual("TopCenter")
        expect(formatParameterValue(40, "alignment")).toStrictEqual("BottomCenter")
        expect(formatParameterValue(72, "alignment")).toStrictEqual("Center")
    })
    it('format color', () => {
        expect(formatParameterValue(0xFF00FF, "color")).toStrictEqual("0xFF00FF")
    })
})

describe('parseParameterValue()', () => {
    it("don't do anything for int and imgid", () => {
        expect(parseParameterValue(124, "imgid")).toStrictEqual(124)
        expect(parseParameterValue(-12, "int")).toStrictEqual(-12)
    })
    it('parse boolean', () => {
        expect(parseParameterValue(false, "bool")).toStrictEqual(0)
        expect(parseParameterValue(true, "bool")).toStrictEqual(1)
    })
    it('parse alignment', () => {
        expect(parseParameterValue("Left", "alignment")).toStrictEqual(2)
        expect(parseParameterValue("Right", "alignment")).toStrictEqual(4)
        expect(parseParameterValue("HCenter", "alignment")).toStrictEqual(8)
        expect(parseParameterValue("Top", "alignment")).toStrictEqual(16)
        expect(parseParameterValue("Bottom", "alignment")).toStrictEqual(32)
        expect(parseParameterValue("VCenter", "alignment")).toStrictEqual(64)
        expect(parseParameterValue("TopLeft", "alignment")).toStrictEqual(18)
        expect(parseParameterValue("BottomLeft", "alignment")).toStrictEqual(34)
        expect(parseParameterValue("CenterLeft", "alignment")).toStrictEqual(66)
        expect(parseParameterValue("TopRight", "alignment")).toStrictEqual(20)
        expect(parseParameterValue("BottomRight", "alignment")).toStrictEqual(36)
        expect(parseParameterValue("CenterRight", "alignment")).toStrictEqual(68)
        expect(parseParameterValue("TopCenter", "alignment")).toStrictEqual(24)
        expect(parseParameterValue("BottomCenter", "alignment")).toStrictEqual(40)
        expect(parseParameterValue("Center", "alignment")).toStrictEqual(72)
    })
    it('parse color', () => {
        expect(parseParameterValue("0xFF00FF", "color")).toStrictEqual(0xFF00FF)
    })
})