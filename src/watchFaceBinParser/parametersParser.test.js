import { readVariableWidthValue, parseParams, convertParametersIdsToHumanReadableName, formatParameterValue } from './parametersParser'

describe('parseParams()', () => {
    it('parse keys and values', () => {
        expect(parseParams(Uint8Array.of(0x08, 0x04, 0x10, 0x6B))).toStrictEqual(
            {
                "1": 0x04,
                "2": 0x6B
            }
        )
    })
    it('parse nested structure', () => {
        expect(parseParams(Uint8Array.of(0x0A, 0x05, 0x08, 0xBC, 0x04, 0x10, 0x6B))).toStrictEqual(
            {
                "1": {
                    "1": 0x023C,
                    "2": 0x6B
                }
            }
        )
    })
    it('parse lists', () => {
        expect(parseParams(Uint8Array.of(0x08, 0x04, 0x10, 0x6B, 0x08, 0x7F))).toStrictEqual(
            {
                "1": [0x04, 0x7F],
                "2": 0x6B
            }
        )
    })
    it('parse multi byte id', () => {
        expect(parseParams(Uint8Array.of(0x80, 0x02, 0x04))).toStrictEqual(
            {
                "32": 0x04
            }
        )
    })
})

describe('readVariableWidthValue()', () => {
    it('parse single byte value', () => {
        expect(readVariableWidthValue(Uint8Array.of(0x73))).toStrictEqual([0x73, 1])
    }),
    it('parse multi byte value', () => {
        expect(readVariableWidthValue(Uint8Array.of(0xF3, 0x42))).toStrictEqual([0x2173, 2])
    })
    it('parse negative values', () => {
        expect(readVariableWidthValue(Uint8Array.of(0xF3, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x01))).toStrictEqual([-13, 10])
    })
    it('parse 31 bit value', () => {
        expect(readVariableWidthValue(Uint8Array.of(0x80, 0x80, 0x80, 0x80, 0x04))).toStrictEqual([1073741824, 5])
    })
    it('parse 32 bit value', () => {
        expect(readVariableWidthValue(Uint8Array.of(0x80, 0x80, 0x80, 0x80, 0x08))).toStrictEqual([2147483648, 5])
    })
    it('parse 33 bit value', () => {
        expect(readVariableWidthValue(Uint8Array.of(0x80, 0x80, 0x80, 0x80, 0x10))).toStrictEqual([4294967296, 5])
    })
})

describe('convertParametersIdsToHumanReadableName()', () => {
    it('convert ids to names', () => {
        expect(convertParametersIdsToHumanReadableName(
            {
                "2": {
                    "1": {
                      "1": 0,
                      "2": 0,
                      "3": 0
                    }
                }
            }
        )).toStrictEqual(
            {
                "Background": {
                    "Image": {
                    "X": 0,
                    "Y": 0,
                    "ImageIndex": 0
                    }
                }
            }
        )
    })
    it('convert ids in lists', () => {
        expect(convertParametersIdsToHumanReadableName(
            {
                "2": {
                    "1": [
                        {
                            "1": 0,
                            "2": 0,
                            "3": 0
                            },
                        {
                            "1": 0,
                            "2": 0,
                            "3": 1
                        }
                    ]
                }
            }
        )).toStrictEqual(
            {
                "Background": {
                    "Image": [
                        {
                            "X": 0,
                            "Y": 0,
                            "ImageIndex": 0
                        },
                        {
                            "X": 0,
                            "Y": 0,
                            "ImageIndex": 1
                        }
                    ]
                }
            }
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
        expect(formatParameterValue(8, "alignment")).toStrictEqual("Center")
        expect(formatParameterValue(16, "alignment")).toStrictEqual("Top")
        expect(formatParameterValue(32, "alignment")).toStrictEqual("Bottom")
        expect(formatParameterValue(64, "alignment")).toStrictEqual("Center")
        expect(formatParameterValue(18, "alignment")).toStrictEqual("TopLeft")
        expect(formatParameterValue(34, "alignment")).toStrictEqual("BottomLeft")
        expect(formatParameterValue(66, "alignment")).toStrictEqual("CenterLeft")
        expect(formatParameterValue(20, "alignment")).toStrictEqual("TopRight")
        expect(formatParameterValue(36, "alignment")).toStrictEqual("BottomRight")
        expect(formatParameterValue(68, "alignment")).toStrictEqual("CenterRight")
        expect(formatParameterValue(24, "alignment")).toStrictEqual("TopCenter")
        expect(formatParameterValue(40, "alignment")).toStrictEqual("BottomCenter")
        expect(formatParameterValue(72, "alignment")).toStrictEqual("CenterCenter")
    })
    it('format color', () => {
        expect(formatParameterValue(0xFF00FF, "color")).toStrictEqual("0xFF00FF")
    })
})