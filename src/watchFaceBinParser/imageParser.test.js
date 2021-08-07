import { parseImage, parseCompressedImage, writeImage } from './imageParser'

describe('parseImage()', () => {
    it('parse 32 bit image', () => {
        expect(parseImage(new Uint8Array(
            [
                0x42, 0x4D, // signature (BM)
                0x10, 0x00, // pixel format (8:8:8:8) rgba
                0x02, 0x00, // width 2px
                0x01, 0x00, // height 1px
                0x08, 0x00, // row width 8 bytes
                0x20, 0x00, // 32 bits per pixel
                0x00, 0x00, // No palette
                0x00, 0x00, // No palette transparency
                0x11, 0x21, 0x31, 0x41, // 1st pixel
                0x12, 0x22, 0x32, 0x42, // 2nd pixel
            ]).buffer)).toStrictEqual(
                {
                    "pixels": new Uint8ClampedArray([
                        0x11, 0x21, 0x31, 0xFF - 0x41, // 1st pixel
                        0x12, 0x22, 0x32, 0xFF - 0x42, // 2nd pixel
                    ]),
                    "width": 2,
                    "height": 1,
                    "bitsPerPixel": 32,
                    "pixelFormat": 0x10
                }
            )
    })
    it('parse 24 bit abgr image', () => {
        expect(parseImage(new Uint8Array(
            [
                0x42, 0x4D, // signature (BM)
                0x1B, 0x00, // pixel format (8:5:6:5) abgr
                0x02, 0x00, // width 2px
                0x01, 0x00, // height 1px
                0x06, 0x00, // row width 6 bytes
                0x18, 0x00, // 24 bits per pixel
                0x00, 0x00, // No palette
                0x00, 0x00, // No palette transparency
                0xBC, 0x4C, 0x31, // 1st pixel
                0x88, 0x22, 0x32, // 2nd pixel
            ]).buffer)).toStrictEqual(
                {
                    "pixels": new Uint8ClampedArray([
                        0x88, 0x84, 0x48, 0xFF - 0xBC, // 1st pixel
                        0x90, 0x44, 0x20, 0xFF - 0x88, // 2nd pixel
                    ]),
                    "width": 2,
                    "height": 1,
                    "bitsPerPixel": 24,
                    "pixelFormat": 0x1B
                }
            )
    })
    it('parse 24 bit argb image', () => {
        expect(parseImage(new Uint8Array(
            [
                0x42, 0x4D, // signature (BM)
                0x1C, 0x00, // pixel format (8:5:6:5) argb
                0x02, 0x00, // width 2px
                0x01, 0x00, // height 1px
                0x06, 0x00, // row width 6 bytes
                0x18, 0x00, // 24 bits per pixel
                0x00, 0x00, // No palette
                0x00, 0x00, // No palette transparency
                0xBC, 0x4C, 0x31, // 1st pixel
                0x88, 0x22, 0x32, // 2nd pixel
            ]).buffer)).toStrictEqual(
                {
                    "pixels": new Uint8ClampedArray([
                        0x48, 0x84, 0x88, 0xFF - 0xBC, // 1st pixel
                        0x20, 0x44, 0x90, 0xFF - 0x88, // 2nd pixel
                    ]),
                    "width": 2,
                    "height": 1,
                    "bitsPerPixel": 24,
                    "pixelFormat": 0x1C
                }
            )
    })
    it('parse 16 bit bgr image', () => {
        expect(parseImage(new Uint8Array(
            [
                0x42, 0x4D, // signature (BM)
                0x08, 0x00, // pixel format (5:6:5) bgr
                0x02, 0x00, // width 2px
                0x01, 0x00, // height 1px
                0x04, 0x00, // row width 4 bytes
                0x10, 0x00, // 16 bits per pixel
                0x00, 0x00, // No palette
                0x00, 0x00, // No palette transparency
                0x31, 0x4C, // 1st pixel
                0x32, 0x22, // 2nd pixel
            ]).buffer)).toStrictEqual(
                {
                    "pixels": new Uint8ClampedArray([
                        0x88, 0x84, 0x48, 0xFF, // 1st pixel
                        0x90, 0x44, 0x20, 0xFF, // 2nd pixel
                    ]),
                    "width": 2,
                    "height": 1,
                    "bitsPerPixel": 16,
                    "pixelFormat": 0x08
                }
            )
    })
    it('parse 16 bit rgb image', () => {
        expect(parseImage(new Uint8Array(
            [
                0x42, 0x4D, // signature (BM)
                0x09, 0x00, // pixel format (5:6:5) rgb
                0x02, 0x00, // width 2px
                0x01, 0x00, // height 1px
                0x04, 0x00, // row width 4 bytes
                0x10, 0x00, // 16 bits per pixel
                0x00, 0x00, // No palette
                0x00, 0x00, // No palette transparency
                0x31, 0x4C, // 1st pixel
                0x32, 0x22, // 2nd pixel
            ]).buffer)).toStrictEqual(
                {
                    "pixels": new Uint8ClampedArray([
                        0x48, 0x84, 0x88, 0xFF, // 1st pixel
                        0x20, 0x44, 0x90, 0xFF, // 2nd pixel
                    ]),
                    "width": 2,
                    "height": 1,
                    "bitsPerPixel": 16,
                    "pixelFormat": 0x09
                }
            )
    })
    it('parse 16 bit abgr image', () => {
        expect(parseImage(new Uint8Array(
            [
                0x42, 0x4D, // signature (BM)
                0x13, 0x00, // pixel format (4:4:4:4) abgr
                0x02, 0x00, // width 2px
                0x01, 0x00, // height 1px
                0x04, 0x00, // row width 4 bytes
                0x10, 0x00, // 16 bits per pixel
                0x00, 0x00, // No palette
                0x00, 0x00, // No palette transparency
                0x31, 0x4C, // 1st pixel
                0x32, 0x22, // 2nd pixel
            ]).buffer)).toStrictEqual(
                {
                    "pixels": new Uint8ClampedArray([
                        16, 48, 192, 191, // 1st pixel
                        32, 48, 32, 223, // 2nd pixel
                    ]),
                    "width": 2,
                    "height": 1,
                    "bitsPerPixel": 16,
                    "pixelFormat": 0x13
                }
            )
    })
    it('parse 8 bit image with palette', () => {
        expect(parseImage(new Uint8Array(
            [
                0x42, 0x4D, // signature (BM)
                0x64, 0x00, // paletted pixel data
                0x02, 0x00, // width 2px
                0x01, 0x00, // height 1px
                0x02, 0x00, // row width 2 bytes
                0x08, 0x00, // 8 bits per pixel
                0x02, 0x00, // 2 colors palette
                0x00, 0x00, // No palette transparency
                0x11, 0x21, 0x31, 0x00, // 1st palette color
                0x12, 0x22, 0x32, 0x00, // 2nd palette color
                0x01, // 1st pixel
                0x00, // 2nd pixel
            ]).buffer)).toStrictEqual(
                {
                    "pixels": new Uint8ClampedArray([
                        0x12, 0x22, 0x32, 0xFF, // 1st pixel
                        0x11, 0x21, 0x31, 0xFF, // 2nd pixel
                    ]),
                    "width": 2,
                    "height": 1,
                    "bitsPerPixel": 8,
                    "pixelFormat": 0x64
                }
            )
    })
    it('parse 8 bit image with palette and transparency', () => {
        expect(parseImage(new Uint8Array(
            [
                0x42, 0x4D, // signature (BM)
                0x64, 0x00, // paletted pixel data
                0x02, 0x00, // width 2px
                0x01, 0x00, // height 1px
                0x02, 0x00, // row width 2 bytes
                0x08, 0x00, // 8 bits per pixel
                0x02, 0x00, // 2 colors palette
                0x01, 0x00, // First palette color is transparent
                0x11, 0x21, 0x31, 0x00, // 1st palette color
                0x12, 0x22, 0x32, 0x00, // 2nd palette color
                0x01, // 1st pixel
                0x00, // 2nd pixel
            ]).buffer)).toStrictEqual(
                {
                    "pixels": new Uint8ClampedArray([
                        0x12, 0x22, 0x32, 0xFF, // 1st pixel
                        0x11, 0x21, 0x31, 0x00, // 2nd pixel
                    ]),
                    "width": 2,
                    "height": 1,
                    "bitsPerPixel": 8,
                    "pixelFormat": 0x64
                }
            )
    })
    it('parse 4 bit image with palette', () => {
        expect(parseImage(new Uint8Array(
            [
                0x42, 0x4D, // signature (BM)
                0x64, 0x00, // paletted pixel data
                0x02, 0x00, // width 2px
                0x01, 0x00, // height 1px
                0x01, 0x00, // row width 1 bytes
                0x04, 0x00, // 4 bits per pixel
                0x02, 0x00, // 2 colors palette
                0x00, 0x00, // No palette transparency
                0x11, 0x21, 0x31, 0x00, // 1st palette color
                0x12, 0x22, 0x32, 0x00, // 2nd palette color
                0x10, // 1st & 2nd pixels
            ]).buffer)).toStrictEqual(
                {
                    "pixels": new Uint8ClampedArray([
                        0x12, 0x22, 0x32, 0xFF, // 1st pixel
                        0x11, 0x21, 0x31, 0xFF, // 2nd pixel
                    ]),
                    "width": 2,
                    "height": 1,
                    "bitsPerPixel": 4,
                    "pixelFormat": 0x64
                }
            )
    })
    it('parse 2 bit image with palette', () => {
        expect(parseImage(new Uint8Array(
            [
                0x42, 0x4D, // signature (BM)
                0x64, 0x00, // paletted pixel data
                0x02, 0x00, // width 2px
                0x01, 0x00, // height 1px
                0x01, 0x00, // row width 1 bytes
                0x02, 0x00, // 2 bits per pixel
                0x02, 0x00, // 2 colors palette
                0x00, 0x00, // No palette transparency
                0x11, 0x21, 0x31, 0x00, // 1st palette color
                0x12, 0x22, 0x32, 0x00, // 2nd palette color
                0x40, // 1st & 2nd pixels
            ]).buffer)).toStrictEqual(
                {
                    "pixels": new Uint8ClampedArray([
                        0x12, 0x22, 0x32, 0xFF, // 1st pixel
                        0x11, 0x21, 0x31, 0xFF, // 2nd pixel
                    ]),
                    "width": 2,
                    "height": 1,
                    "bitsPerPixel": 2,
                    "pixelFormat": 0x64
                }
            )
    })
    it('parse 1 bit image with palette', () => {
        expect(parseImage(new Uint8Array(
            [
                0x42, 0x4D, // signature (BM)
                0x64, 0x00, // paletted pixel data
                0x02, 0x00, // width 2px
                0x01, 0x00, // height 1px
                0x01, 0x00, // row width 1 bytes
                0x01, 0x00, // 1 bits per pixel
                0x02, 0x00, // 2 colors palette
                0x00, 0x00, // No palette transparency
                0x11, 0x21, 0x31, 0x00, // 1st palette color
                0x12, 0x22, 0x32, 0x00, // 2nd palette color
                0x80, // 1st & 2nd pixels
            ]).buffer)).toStrictEqual(
                {
                    "pixels": new Uint8ClampedArray([
                        0x12, 0x22, 0x32, 0xFF, // 1st pixel
                        0x11, 0x21, 0x31, 0xFF, // 2nd pixel
                    ]),
                    "width": 2,
                    "height": 1,
                    "bitsPerPixel": 1,
                    "pixelFormat": 0x64
                }
            )
    })
    it('parse compressed image', () => {
        expect(parseImage(new Uint8Array(
            [
                0x42, 0x4d, // signature (BM)
                0x65, 0x00, // compressed image
                0x02, 0x00, // width 2px
                0x02, 0x00, // height 2px
                0x04, 0x00, // row width 4 bytes
                0x10, 0x00, // 16 bits per pixels ?
                0x14, 0x00, 0x00, 0x00,// 14 byte long pixel data
                0x00, 0x00, // coordinate y=0
                0x00, 0x00, // coordinate x=0
                0x02, 0x00, // 2 pixels long
                0xff, 0xff, // first pixel
                0xff, 0xff, // second pixel
                0x01, 0x00, // coordinate y=1
                0x00, 0x00, // coordinate x=0
                0x02, 0x00, // 2 pixels long
                0xff, 0xff, // first pixel (3rd pixel of image)
                0x9a, 0xd6  // second pixel (4th pixel of image)
            ]).buffer)).toStrictEqual(
                {
                    "pixels": new Uint8ClampedArray([
                        0xF8, 0xFC, 0xF8, 0xFF, // 1st pixel
                        0xF8, 0xFC, 0xF8, 0xFF, // 2nd pixel
                        0xF8, 0xFC, 0xF8, 0xFF, // 3rd pixel
                        0xD0, 0xD0, 0xD0, 0xFF, // 4th pixel
                    ]),
                    "width": 2,
                    "height": 2,
                    "bitsPerPixel": 16,
                    "pixelFormat": 0x65
                }
            )
    })
})

describe('writeImage()', () => {
    it('write 24 bit abgr image', () => {
        expect(new Uint8Array(writeImage(new Uint8ClampedArray([
            0x88, 0x84, 0x48, 0xFF - 0xBC, // 1st pixel
            0x90, 0x44, 0x20, 0xFF - 0x88, // 2nd pixel
        ]), 2, 1))).toStrictEqual(
            new Uint8Array([
                0x42, 0x4D, // signature (BM)
                0x1B, 0x00, // pixel format (8:5:6:5) abgr
                0x02, 0x00, // width 2px
                0x01, 0x00, // height 1px
                0x06, 0x00, // row width 6 bytes
                0x18, 0x00, // 24 bits per pixel
                0x00, 0x00, // No palette
                0x00, 0x00, // No palette transparency
                0xBC, 0x4C, 0x31, // 1st pixel
                0x88, 0x22, 0x32, // 2nd pixel
            ]))
    })
})