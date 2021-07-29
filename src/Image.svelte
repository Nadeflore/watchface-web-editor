<script>
	export let image;
	export let displaySize = undefined;

	import { onMount } from 'svelte';
	
	let canvas;

	$: if (canvas) {
		canvas.width = image.width;
		canvas.height = image.height;
		const ctx = canvas.getContext("2d");
		const imageData = ctx.createImageData(
					image.width,
					image.height
				);

		imageData.data.set(image.pixels)

		ctx.putImageData(imageData, 0, 0);
	}

	$: if (displaySize && canvas) {
		canvas.style.width = displaySize.width + "px"
		canvas.style.height = displaySize.height + "px"
	}
</script>

<canvas class="image" bind:this={canvas}></canvas>