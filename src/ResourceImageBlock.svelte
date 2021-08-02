<script>
	export let image;
	export let id;

	import { createEventDispatcher } from "svelte";

	import ImageComponent from "./Image.svelte";
	import OpenImageButton from "./OpenImageButton.svelte";
	import { computeSizeToFitArea } from "./utils";

	const dispatch = createEventDispatcher();

	let checkeredBackground;
	const imageDisplayAreaWidth = 80;
	const imageDisplayAreaHeight = 100;

	$: imageDisplaySize = computeSizeToFitArea(
		image.width,
		image.height,
		imageDisplayAreaWidth,
		imageDisplayAreaHeight
	);

	const handleImageLoad = (event) => {
		const imageInfo = event.detail.images[0];
		image.pixels = imageInfo.pixels;
		image.width = imageInfo.width;
		image.height = imageInfo.height;
	};
</script>

<div class="image-block">
	<div class="id">
		{id}
		<OpenImageButton on:imageLoad={handleImageLoad}>R</OpenImageButton>
	</div>
	<div class="image-container">
		<div
			class="checkered-background"
			bind:this={checkeredBackground}
			style="width: {imageDisplaySize.width}px; height: {imageDisplaySize.height}px"
		>
			<ImageComponent {image} displaySize={imageDisplaySize} />
		</div>
	</div>
	<div class="info">
		<div class="size">{image.width} x {image.height}</div>
		<div class="bits-per-pixel">{image.bitsPerPixel}bit</div>
		<div class="pixel-format">
			{image.pixelFormat ? image.pixelFormat.toString(16) : ""}
		</div>
	</div>
</div>

<style>
	.image-block {
		margin: 10px;
		border: 1px solid black;
	}

	.image-container {
		width: 80px;
		height: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.checkered-background {
		background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKAQMAAAC3/F3+AAAABlBMVEXMzMyAgIDkPTOPAAAAEElEQVQI12P4wYCC2A8gIwCK3gi8+4tyLQAAAABJRU5ErkJggg==);
		background-repeat: repeat, repeat;
	}
</style>
