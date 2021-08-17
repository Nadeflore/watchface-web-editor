import { parseParameterValue } from './parametersParser'
// Descriptor containing all objects to display in the given order
const DISPLAY_INFO = [
    {
        path: "Background.Image",
        type: "always"
    },
    {
        path: "Background.ImageIndex",
        type: "always"
    },
    // TODO: support flag drawOrder DisplayMinutesFirst
    {
        path: "Time.Hours",
        type: "twoDigits",
        statusName: "hours"
    },
    {
        path: "Time.Minutes",
        type: "twoDigits",
        statusName: "minutes"
    },
    {
        path: "Time.Seconds",
        type: "twoDigits",
        statusName: "seconds"
    },
    {
        path: "Time.DelimiterImage",
        type: "always"
    },
    {
        path: "Time.TimeDelimiterImage",
        type: "always"
    },
    {
        path: "TimeNew.Hours",
        type: "number",
        statusName: "hours",
        padZeros: 2
    },
    {
        path: "TimeNew.MinutesAndSeconds.Minutes",
        type: "number",
        statusName: "minutes",
        padZeros: 2
    },
    {
        path: "TimeNew.MinutesAndSeconds.Seconds",
        type: "number",
        statusName: "seconds",
        padZeros: 2
    },
    {
        path: "Activity.Steps",
        type: "numberWithExtra",
        statusName: "steps"
    },
    {
        path: "Activity.Calories",
        type: "numberWithExtra",
        statusName: "calories"
    },
    {
        path: "Activity.Pulse",
        type: "numberWithExtra",
        statusName: "pulse"
    },
    {
        path: "Activity.Distance",
        type: "numberWithExtra",
        statusName: "distance"
    },
    {
        path: "Activity.PAI",
        type: "numberWithExtra",
        statusName: "pai"
    },
    {
        path: "Date.MonthAndDayAndYear.Separate.Month",
        type: "number",
        statusName: "month",
        padZeros: 2
    },
    {
        path: "Date.MonthAndDayAndYear.Separate.Months{lang}",
        type: "imageFromRange",
        statusName: "month",
    },
    {
        path: "Date.MonthAndDayAndYear.Separate.Day",
        type: "number",
        statusName: "day",
        padZeros: 2
    },
    {
        path: "Date.MonthAndDayAndYear.SeparateNew.Month",
        type: "number",
        statusName: "month",
        padZeros: 2
    },
    {
        path: "Date.MonthAndDayAndYear.SeparateNew.Day",
        type: "number",
        statusName: "day",
        padZeros: 2
    },
    {
        path: "Date.MonthAndDayAndYear.OneLine",
        type: "numberWithDelimiter",
        statusName: "month/day",
        padZeros: 2
    },
    {
        path: "Date.MonthAndDayAndYear.OneLineWithYear",
        type: "numberWithDelimiter",
        statusName: "year/month/day",
        padZeros: 2
    },
    {
        path: "Date.DayAmPm",
        type: "ampm",
        statusName: "pm"
    },
    {
        path: "Date.{lang}WeekDays",
        type: "imageFromRange",
        statusName: "weekday"
    },
    {
        path: "Date.WeekDays",
        type: "imageFromRange",
        statusName: "weekday"
    },
    {
        path: "Weather.Icon.CustomIcon",
        type: "imageFromRange",
        statusName: "weather"
    },
    {
        path: "Weather.Temperature.Current",
        type: "numberWithExtra",
        statusName: "currentTemperature"
    },
    {
        path: "Weather.Temperature.Today.Separate.Day",
        type: "numberWithExtra",
        statusName: "dayTemperature"
    },
    {
        path: "Weather.Temperature.Today.Separate.Night",
        type: "numberWithExtra",
        statusName: "nightTemperature"
    },
    {
        path: "Weather.Temperature.Today.OneLine",
        type: "numberWithDelimiter",
        statusName: "dayTemperature/nightTemperature"
    },
    {
        path: "Weather.Humidity",
        type: "numberWithExtra",
        statusName: "humidity"
    },
    {
        path: "Weather.Wind",
        type: "numberWithExtra",
        statusName: "wind"
    },
    // TODO: chinese uv index display
    {
        path: "Weather.UVIndex.UV",
        type: "numberWithExtra",
        statusName: "uvi"
    },
    {
        path: "StepsProgress.LineScale",
        type: "lineScale",
        statusName: "stepsPercent"
    },
    {
        path: "StepsProgress.Linear",
        type: "linear",
        statusName: "stepsPercent"
    },
    {
        path: "Status.DoNotDisturb",
        type: "onoff",
        statusName: "doNotDisturb"
    },
    {
        path: "Status.Lock",
        type: "onoff",
        statusName: "lock"
    },
    {
        path: "Status.Bluetooth",
        type: "onoff",
        statusName: "bluetooth"
    },
    {
        path: "Status.Battery.Number",
        type: "number",
        statusName: "batteryPercent"
    },
    {
        path: "Status.Battery.BatteryIcon",
        type: "lineScale",
        statusName: "batteryPercent"
    },
    {
        path: "Battery.BatteryText",
        type: "numberWithExtra",
        statusName: "batteryPercent"
    },
    {
        path: "Battery.BatteryIcon",
        type: "lineScale",
        statusName: "batteryPercent"
    },
    {
        path: "Battery.Linear",
        type: "linear",
        statusName: "batteryPercent"
    },
    {
        path: "Other.Animation",
        type: "animation",
        statusName: "animationTime"
    },
    {
        path: "HeartProgress.LineScale",
        type: "lineScale",
        statusName: "heartPercent"
    },
    {
        path: "HeartProgress.Linear",
        type: "linear",
        statusName: "heartPercent"
    },
    {
        path: "CaloriesProgress.LineScale",
        type: "lineScale",
        statusName: "caloriesPercent"
    },
    {
        path: "CaloriesProgress.Linear",
        type: "linear",
        statusName: "caloriesPercent"
    },
    {
        path: "WeekDaysIcons",
        type: "weekday",
        statusName: "weekday"
    },
    {
        path: "Alarm",
        type: "numberWithDelimiter",
        statusName: "alarmHours/alarmMinutes",
        padZeros: 2
    },
    {
        path: "Alarm",
        type: "onoff",
        statusName: "alarmOnOff"
    },
    // TODO: Status2 is supposed to be stacked
    {
        path: "Status2.DoNotDisturb",
        type: "onoff",
        statusName: "doNotDisturb"
    },
    {
        path: "Status2.Lock",
        type: "onoff",
        statusName: "lock"
    },
    {
        path: "Status2.Bluetooth",
        type: "onoff",
        statusName: "bluetooth"
    }
]

/**
 * Return the ids and positions of the images to display to generate a preview of the given status
 * @param {object} parameters Parameters of the watchface
 * @param {{width: number, height: number}[]} images Resources images of the watchface (actual data is not needed, only size is enough)
 * @param {object} status object containing the status to display
 * @returns {{imageId: number, position: {x: number, y: number}}[]}
 */
export function generatePreview(parameters, images, status) {
    const result = []

    for (const info of DISPLAY_INFO) {
        const lang = status.locale?.lang
        // check path exists in parameter
        let parameter = getPath(parameters, info.path, lang)

        if (!parameter) {
            // not found in this watchface, skip
            continue
        }
        let value, values
        if (info.statusName) {
            values = info.statusName.split("/").map(e => status[e])
            value = values[0]
        }


        switch (info.type) {
            case "always":
                if (typeof parameter === "number") {
                    result.push({
                        imageId: parameter,
                        position: {
                            x: 0,
                            y: 0
                        }
                    })
                } else {
                    displaySingleImage(result, parameter)
                }
                break

            case "twoDigits":
                //format number as string with leading zeros
                const chars = String(value).padStart(2, '0')

                displayImageFromRange(result, parameter.Tens, +chars[0])
                displayImageFromRange(result, parameter.Ones, +chars[1])
                break

            case "number":
                displayText(result, images, convertNumberToImageIds(Math.round(value), parameter, info.padZeros), parameter)
                break

            case "imageFromRange":
                displayImageFromRange(result, parameter, value - 1)
                break

            case "numberWithExtra":
                if (parameter.SpacingX !== undefined) {
                    parameter = { Number: { ...parameter } }
                    // Actually just a number
                    if (info.path.startsWith("Weather.Temperature.") && parameters.Weather.Temperature.Symbols) {
                        parameter = { ...parameter, ...parameters.Weather.Temperature.Symbols }
                    }
                }

                let textImageIds
                if (value) {
                    textImageIds = convertNumberToImageIds(value, parameter.Number, info.padZeros, parameter.DecimalPointImageIndex, parameter.MinusImageIndex)
                } else if (parameter.NoDataImageIndex) {
                    textImageIds = [parameter.NoDataImageIndex]
                } else {
                    // No value, and no NoDataImageIndex, nothing to display here
                    break
                }

                if (parameter.PrefixImageIndex) {
                    textImageIds.unshift(parameter.PrefixImageIndex)
                }
                if (parameter.SuffixImageIndex) {
                    textImageIds.push(parameter.SuffixImageIndex)
                }
                if (parameter[`SuffixImageIndex${lang}`]) {
                    textImageIds.push(parameter[`SuffixImageIndex${lang}`])
                }
                if (parameter.KmSuffixImageIndex && !status.locale.imperial) {
                    textImageIds.push(parameter.KmSuffixImageIndex)
                }
                if (parameter.MilesSuffixImageIndex && status.locale.imperial) {
                    textImageIds.push(parameter.MilesSuffixImageIndex)
                }

                displayText(result, images, textImageIds, parameter.Number)

                // If there is a positionned suffix image
                if (parameter.ImagePosSuffix) {
                    displaySingleImage(result, parameter.ImagePosSuffix)
                }

                if (parameter[`ImagePosSuffix${lang}`]) {
                    displaySingleImage(result, parameter[`ImagePosSuffix${lang}`])
                }

                break

            case "numberWithDelimiter": {
                if (!parameter.Number) {
                    break
                }
                const textImageIds = values.map(v => convertNumberToImageIds(v, parameter.Number, info.padZeros, null, parameter.MinusImageIndex))
                    .reduce((a, b) => {
                        if (parameter.SuffixImageIndex && parameter.AppendSuffixToAll) {
                            a.push(parameter.SuffixImageIndex)
                        }
                        return [...a, parameter.DelimiterImageIndex, ...b]
                    })

                if (parameter.SuffixImageIndex) {
                    textImageIds.push(parameter.SuffixImageIndex)
                }
                displayText(result, images, textImageIds, parameter.Number)
                break
            }

            case "ampm":
                if (!status.locale.time24h) {
                    const ampm = value ? "PM" : "AM"
                    const imageId = parameter[`ImageIndex${ampm}${lang}`]
                    let x = parameter[`X_${lang}`] || parameter.X
                    let y = parameter[`Y_${lang}`] || parameter.Y
                    if (parameter.AMPosition && !value) {
                        x = parameter.AMPosition.X
                        y = parameter.AMPosition.Y
                    }
                    if (parameter.PMPosition && value) {
                        x = parameter.PMPosition.X
                        y = parameter.PMPosition.Y
                    }
                    displayImage(result, imageId, x, y)
                }
                break;

            case "onoff":
                if (parameter.OnImageIndex !== undefined && value) {
                    displayImage(result, parameter.OnImageIndex, parameter.Coordinates.X, parameter.Coordinates.Y)
                }
                if (parameter.OffImageIndex !== undefined && !value) {
                    displayImage(result, parameter.OffImageIndex, parameter.Coordinates.X, parameter.Coordinates.Y)
                }
                if (parameter.OnImage !== undefined && value) {
                    displaySingleImage(result, parameter.OnImage)
                }
                if (parameter.OffImage !== undefined && !value) {
                    displaySingleImage(result, parameter.OffImage)
                }
                break

            case "lineScale":
                displayImageFromRange(result, parameter, Math.round(value / 100 * (parameter.ImagesCount - 1)))
                break

            case "linear":
                const progress = Math.round(value / 100 * (parameter.Segments.length - 1))
                for (let i = 0; i <= progress; i++) {
                    const pos = parameter.Segments[i]
                    displayImage(result, parameter.StartImageIndex + i, pos.X, pos.Y)
                }
                break

            case "weekday":
                const weekDayString = {
                    "1": "Monday",
                    "2": "Tuesday",
                    "3": "Wednesday",
                    "4": "Thursday",
                    "5": "Friday",
                    "6": "Saturday",
                    "7": "Sunday"
                }[value]
                displaySingleImage(result, parameter[weekDayString])
                break

            case "animation":

                for (const animation of Array.isArray(parameter) ? parameter : [parameter]) {
                    // Real watch can't display faster than about 80ms interval
                    const speed = Math.max(animation.Speed, 80)
                    const currentFrame = Math.round(value / speed)
                    const currentFrameLooped = currentFrame % animation.AnimationImages.ImagesCount

                    // display only if repeat count is not exceeded
                    if (animation.RepeatCount === 0 || currentFrame < animation.RepeatCount * animation.AnimationImages.ImagesCount)
                        displayImageFromRange(result, animation.AnimationImages, currentFrameLooped)
                }

                break
        }
    }

    // Check all imagesIds are valids
    for (const imageInfo of result) {
        if (typeof imageInfo.imageId !== 'number') {
            throw new Error("Invalid image Id")
        }

        if (imageInfo.imageId >= images.length) {
            throw new Error("Image Id out of range")
        }
    }

    return result
}

/**
 * Return the value at `path` in object if it exists, undefined otherwise
 * @param {object} object 
 * @param {string} path 
 * @param {string} lang Languages to use (EN, CN, CN2)
 */
function getPath(object, path, lang) {
    let result = object
    for (const key of path.replace("{lang}", lang).split(".")) {
        result = result[key]
        if (result === undefined) {
            break
        }
    }
    return result
}

function displayImage(result, imageId, x, y) {
    result.push({
        imageId,
        position: {
            x,
            y
        }
    })
}

function displaySingleImage(result, singleImageParameter) {
    result.push({
        imageId: singleImageParameter.ImageIndex,
        position: {
            x: singleImageParameter.X,
            y: singleImageParameter.Y
        }
    })
}

function displayImageFromRange(result, imageRangeParameter, value) {
    result.push({
        imageId: imageRangeParameter.ImageIndex + value,
        position: {
            x: imageRangeParameter.X,
            y: imageRangeParameter.Y
        }
    })
}

function displayText(result, images, elementImageIds, style) {
    // convert aligment to flag value
    const alignment = parseParameterValue(style.Alignment, "alignment")

    // compute width of text to display
    const textWidth = elementImageIds.map(imgId => images[imgId].width).reduce((a, b) => a + b + style.SpacingX)

    // compute coordinates of the left of the first character
    let x = computePositionWithAligment(style.TopLeftX, style.BottomRightX, textWidth, alignment)

    // Add all characters
    for (const [i, elementImageId] of elementImageIds.entries()) {
        const image = images[elementImageId]
        result.push({
            imageId: elementImageId,
            position: {
                x: x,
                y: computePositionWithAligment(style.TopLeftY, style.BottomRightY, image.height, alignment >> 3) + i * (style.SpacingY || 0)
            }
        })

        x += image.width + style.SpacingX
    }
}

/**
 * Compute position of element withing the given bounds for the given aligment
 * @param {number} lowerBound 
 * @param {number} upperBound 
 * @param {number} elementSize
 * @param {number} alignment //flag containing the aligment 2: upper bound, 4: lower bound, 8: centered
 * @returns {{x: number, y: number}}
 */
function computePositionWithAligment(lowerBound, upperBound, elementSize, alignment) {
    let result
    if (alignment & 0x02) {
        // lower bound align
        result = lowerBound

    } else if (alignment & 0x04) {
        // upper bound align
        result = upperBound - elementSize

    } else /*if (alignment & 0x08)*/ {
        // center align (default)
        result = Math.round((lowerBound + upperBound) / 2 - elementSize / 2)
    }

    // don't allow to go lower than the lower bound
    return Math.max(result, lowerBound)
}


function convertNumberToImageIds(value, imageRange, padZeros = 0, decimalPointImageIndex, minusImageIndex) {
    // convert number to string
    const digitsString = String(value).padStart(padZeros, "0")

    return [...digitsString].map(digit => {
        if (digit === '.') {
            return decimalPointImageIndex
        }
        if (digit === '-') {
            return minusImageIndex
        }

        return imageRange.ImageIndex + (+digit)
    })
}