<script>
    export let parameters
    export let images

    import Image from './Image.svelte'
    import { generatePreview } from './watchFaceBinParser/previewGenerator'
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let imagesToDisplay = []

    const status = {
        hours: 12,
        minutes: 6,
        steps: 12882,
        stepsPercent: 67,
        calories: 3453,
        caloriesPercent: 20,
        pulse: 123,
        heartPercent: 43,
        distance: 12.3,
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
            imperial: false
        }
    }

    $: {
		try {
			imagesToDisplay = generatePreview(parameters, images, status).map(e => ({image: images[e.imageId], position: e.position }))
		} catch(e) {
            dispatch("error", {message: e})
		}
	}


    setInterval(() => {status.animationTime += 50}, 50);
</script>
<div class="preview-tab">
    <div class="display-area">
        {#each imagesToDisplay as imageToDisplay}
            <Image image={imageToDisplay.image}  position={imageToDisplay.position}/>
        {/each}
    </div>

</div>

<style>
    .preview-tab {
        width: 200px;
        height: 100%;
        display: flex;
        align-items: center;
  		justify-content: center;
    }

    .display-area {
        position: relative;
        border: 1px solid black;
        width: 124px;
        height: 294px;
        overflow: hidden;
    }
</style>