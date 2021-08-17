<script>
    import Image from "./Image.svelte";
    import { generatePreview } from "./watchFaceBinParser/previewGenerator";
    import {
        watchModelDescriptor,
        parameters,
        images,
        errorMessage,
    } from "./stores";

    let imagesToDisplay = [];

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

    $: {
        try {
            imagesToDisplay = generatePreview($parameters, $images, status).map(
                (e) => ({
                    image: $images[
                        e.imageId -
                            ($watchModelDescriptor.fileType.imageCountOffset ||
                                0)
                    ],
                    position: e.position,
                })
            );
        } catch (e) {
            console.error(e);
            errorMessage.set(e);
        }
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

    let displayArea;
    let x = 0;
    let y = 0;

    function handleMouseover(e) {
        const rect = displayArea.getBoundingClientRect();
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
</script>

<div class="preview-tab">
    {#if $watchModelDescriptor}
        <div
            class="display-area"
            style="width: {$watchModelDescriptor.screen
                .width}px; height: {$watchModelDescriptor.screen
                .height}px; border-radius: {$watchModelDescriptor.screen
                .roundedBorder}px"
            on:mousemove={handleMouseover}
            bind:this={displayArea}
        >
            {#each imagesToDisplay as imageToDisplay}
                <Image
                    image={imageToDisplay.image}
                    position={imageToDisplay.position}
                />
            {/each}
        </div>
    {/if}
    <div>{x},{y}</div>
    <button on:click={toogleAnimation}
        >{animationIntervalId ? "stop" : "play"} animation</button
    >
</div>

<style>
    .preview-tab {
        height: 100%;
        overflow: auto;
        padding: 5px;
        flex-shrink: 0;
    }

    .display-area {
        position: relative;
        background-color: black;
        width: 124px;
        height: 294px;
        overflow: hidden;
    }
</style>
