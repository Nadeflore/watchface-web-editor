<script>
	export let image;
	export let displaySize = undefined;
	export let position = undefined;

	let canvas;

	$: if (canvas) {
		canvas.width = image.width;
		canvas.height = image.height;
		const ctx = canvas.getContext("2d");
		const imageData = ctx.createImageData(image.width, image.height);

		imageData.data.set(image.pixels);

		ctx.putImageData(imageData, 0, 0);
	}

	$: if (displaySize && canvas) {
		canvas.style.width = displaySize.width + "px";
		canvas.style.height = displaySize.height + "px";
	}

	$: if (position && canvas) {
		canvas.style.position = "absolute";
		canvas.style.left = position.x + "px";
		canvas.style.top = position.y + "px";
	}
</script>

<canvas class="image" bind:this={canvas} />
