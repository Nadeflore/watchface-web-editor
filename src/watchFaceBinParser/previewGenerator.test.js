import { generatePreview } from './previewGenerator'

describe('generatePreview()', () => {
    it('generate simple preview', () => {
        expect(generatePreview(
            { "Background": { "Image": { "X": 0, "Y": 0, "ImageIndex": 0 } } },
            [{ "width": 2, "height": 1 }],
            {}
        )).toStrictEqual(
            [
                { imageId: 0, position: { x: 0, y: 0 } }
            ]
        )
    })
})

describe('generatePreview()', () => {
    it('generate preview with time displayed', () => {
        expect(generatePreview(
            { "Background": { "Image": { "X": 0, "Y": 0, "ImageIndex": 0 } },
            "Time": {
                "Hours": { "Tens": { "X": 10, "Y": 20, "ImageIndex": 1, "ImagesCount": 10 }, "Ones": { "X": 15, "Y": 20, "ImageIndex": 1, "ImagesCount": 10 }},
                "Minutes": { "Tens": { "X": 10, "Y": 40, "ImageIndex": 1, "ImagesCount": 10 }, "Ones": { "X": 15, "Y": 40, "ImageIndex": 1, "ImagesCount": 10 }}
            }},
            [{ "width": 2, "height": 1 },{ "width": 2, "height": 1 },{ "width": 2, "height": 1 },{ "width": 2, "height": 1 },{ "width": 2, "height": 1 },{ "width": 2, "height": 1 },{ "width": 2, "height": 1 },{ "width": 2, "height": 1 },{ "width": 2, "height": 1 },{ "width": 2, "height": 1 },{ "width": 2, "height": 1 }],
            {
                "hours": 11,
                "minutes": 6
            }
        )).toStrictEqual(
            [
                { imageId: 0, position: { x: 0, y: 0 } }, // background
                { imageId: 2, position: { x: 10, y: 20 } }, // hours first digit 1
                { imageId: 2, position: { x: 15, y: 20 } }, // hours second digit 1
                { imageId: 1, position: { x: 10, y: 40 } }, // minutes first digit 0
                { imageId: 7, position: { x: 15, y: 40 } }, // minutes second digit 6

            ]
        )
    })
})

describe('generatePreview()', () => {
    it('generate preview with steps displayed', () => {
        expect(generatePreview(
            { "Background": { "Image": { "X": 0, "Y": 0, "ImageIndex": 0 } },
            "Activity": {
                "Steps": { "Number": {
                    "TopLeftX": 10,
                    "TopLeftY": 20,
                    "BottomRightX": 100,
                    "BottomRightY": 50,
                    "Alignment": "CenterLeft",
                    "SpacingX": 1,
                    "SpacingY": 0,
                    "ImageIndex": 1,
                    "ImagesCount": 10
                  }}
            }},
            [{ "width": 2, "height": 1 },{ "width": 5, "height": 8 },{ "width": 5, "height": 8 },{ "width": 5, "height": 8 },{ "width": 5, "height": 8 },{ "width": 5, "height": 8 },{ "width": 5, "height": 8 },{ "width": 5, "height": 8 },{ "width": 5, "height": 8 },{ "width": 5, "height": 8 },{ "width": 5, "height": 8 }],
            {
                "steps": 1284
            }
        )).toStrictEqual(
            [
                { imageId: 0, position: { x: 0, y: 0 } }, // background
                { imageId: 2, position: { x: 10, y: 31 } }, // first digit 1
                { imageId: 3, position: { x: 16, y: 31 } }, // second digit 2
                { imageId: 9, position: { x: 22, y: 31 } }, // third digit 8
                { imageId: 5, position: { x: 28, y: 31 } }, // fourth digit 4

            ]
        )
    })
})

describe('generatePreview()', () => {
    it('generate preview with TopCenter Aligment', () => {
        expect(generatePreview(
            { "Background": { "Image": { "X": 0, "Y": 0, "ImageIndex": 0 } },
            "Activity": {
                "Steps": { "Number": {
                    "TopLeftX": 10,
                    "TopLeftY": 20,
                    "BottomRightX": 100,
                    "BottomRightY": 50,
                    "Alignment": "TopCenter",
                    "SpacingX": 1,
                    "SpacingY": 0,
                    "ImageIndex": 1,
                    "ImagesCount": 10
                  }}
            }},
            [{ "width": 2, "height": 1 },{ "width": 5, "height": 8 },{ "width": 5, "height": 8 },{ "width": 5, "height": 8 },{ "width": 5, "height": 8 },{ "width": 5, "height": 8 },{ "width": 5, "height": 8 },{ "width": 5, "height": 8 },{ "width": 5, "height": 8 },{ "width": 5, "height": 8 },{ "width": 5, "height": 8 }],
            {
                "steps": 1284
            }
        )).toStrictEqual(
            [
                { imageId: 0, position: { x: 0, y: 0 } }, // background
                { imageId: 2, position: { x: 44, y: 20 } }, // first digit 1
                { imageId: 3, position: { x: 50, y: 20 } }, // second digit 2
                { imageId: 9, position: { x: 56, y: 20 } }, // third digit 8
                { imageId: 5, position: { x: 62, y: 20 } }, // fourth digit 4

            ]
        )
    })
})