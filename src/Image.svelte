<script>
	export let image;

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
</script>

<canvas bind:this={canvas}></canvas>