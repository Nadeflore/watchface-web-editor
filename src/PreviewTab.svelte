<script>
    import Image from "./Image.svelte";
    import { generatePreview } from "watchface-js/previewGenerator";
    import {
        watchModelDescriptor,
        parameters,
        images,
        errorMessage,
    } from "./stores";

    let previewTabDiv;
    let canvas;

    const status = {
        hours: 12,
        minutes: 6,
        seconds: 34,
        steps: 12882,
        stepsPercent: 67,
        calories: 3453,
        caloriesPercent: 20,
        pulse: 123,
        heartPercent: 43,
        distance: 14.6,
        pai: 156,
        year: 2021,
        month: 3,
        day: 23,
        pm: true,
        weekday: 4,
        weather: 5,
        currentTemperature: 26,
        dayTemperature: 43,
        nightTemperature: -10,
        humidity: 98,
        wind: 12,
        uvi: 10,
        doNotDisturb: true,
        lock: false,
        bluetooth: false,
        batteryPercent: 64,
        alarmHours: 6,
        alarmMinutes: 0,
        alarmOnOff: true,
        animationTime: 0,
        locale: {
            lang: "EN",
            imperial: false,
        },
    };

    $: if (canvas && $watchModelDescriptor) {
        canvas.width = $watchModelDescriptor.screen.width;
        canvas.height = $watchModelDescriptor.screen.height;
    }

    $: if (canvas && $watchModelDescriptor) {
        const ctx = canvas.getContext("2d");
        let imagesWithPositionPromise = [];
        try {
            imagesWithPositionPromise = generatePreview(
                $parameters,
                $images,
                status,
                $watchModelDescriptor
            ).map((e) => {
                if (e.canvas) {
                    return new Promise((resolve) => {
                        resolve({
                            image: e.canvas,
                            position: e.position,
                        });
                    });
                }
                const image =
                    $images[
                        e.imageId -
                            ($watchModelDescriptor.fileType.imageCountOffset ||
                                0)
                    ];
                const imageData = ctx.createImageData(
                    image.width,
                    image.height
                );
                imageData.data.set(image.pixels);
                return new Promise((resolve) => {
                    createImageBitmap(imageData).then((img) => {
                        resolve({
                            image: img,
                            position: e.position,
                        });
                    });
                });
            });
        } catch (e) {
            console.error(e);
            errorMessage.set(e);
        }

        Promise.all(imagesWithPositionPromise).then((imagesWithPosition) => {
            // Clip to visible area
            const r = $watchModelDescriptor.screen.roundedBorder;
            const w = canvas.width;
            const h = canvas.height;
            ctx.beginPath();
            ctx.moveTo(r, 0);
            ctx.arcTo(w, 0, w, h, r);
            ctx.arcTo(w, h, 0, h, r);
            ctx.arcTo(0, h, 0, 0, r);
            ctx.arcTo(0, 0, w, 0, r);
            ctx.closePath();
            ctx.clip();
            // Fill background with black
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // draw actual images
            imagesWithPosition.forEach((img) => {
                ctx.drawImage(img.image, img.position.x, img.position.y);
            });
        });
    }

    let animationIntervalId = undefined;

    function toogleAnimation() {
        if (animationIntervalId) {
            clearInterval(animationIntervalId);
            animationIntervalId = undefined;
            status.animationTime = 0;
        } else {
            animationIntervalId = setInterval(() => {
                status.animationTime += 50;
            }, 50);
        }
    }

    const cursorCoordinates = { x: 0, y: 0 };
    let coordinatesBoxPosition = null;

    function handleMouseover(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        cursorCoordinates.x = Math.round((e.clientX - rect.left) * scaleX);
        cursorCoordinates.y = Math.round((e.clientY - rect.top) * scaleY);

        const outerRect = previewTabDiv.getBoundingClientRect();
        coordinatesBoxPosition = {
            x: e.clientX - outerRect.left + 10,
            y: e.clientY - outerRect.top + 20,
        };
    }
</script>

<div class="preview-tab" bind:this={previewTabDiv}>
    <canvas
        class="preview-image"
        bind:this={canvas}
        on:mousemove={handleMouseover}
        on:mouseout={() => (coordinatesBoxPosition = null)}
        on:blur={() => (coordinatesBoxPosition = null)}
    />
    {#if coordinatesBoxPosition}
        <div
            class="coordinates-box"
            style="left: {coordinatesBoxPosition.x}px; top: {coordinatesBoxPosition.y}px;"
        >
            {cursorCoordinates.x},{cursorCoordinates.y}
        </div>
    {/if}
    <div>
        <button on:click={toogleAnimation}
            >{animationIntervalId ? "stop" : "play"} animation</button
        >
    </div>
</div>

<style>
    .preview-tab {
        position: relative;
        height: 100%;
        padding: 5px;
        flex-shrink: 0;
        max-width: 100%;
        max-height: 100%;
    }

    .preview-image {
        max-width: 100%;
        max-height: 100%;
    }

    .coordinates-box {
        position: absolute;
        background: white;
        pointer-events: none;
    }
</style>
