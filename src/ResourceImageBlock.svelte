<script>
	export let image;
	export let id;

	import { createEventDispatcher } from "svelte";
	import { images, watchModelDescriptor } from "./stores";

	import ImageComponent from "./Image.svelte";
	import OpenImageButton from "./OpenImageButton.svelte";
	import { computeSizeToFitArea } from "./utils";

	const dispatch = createEventDispatcher();

	let imageContainerHeight = 1;
	$: imageDisplaySize = computeSizeToFitArea(
		image.width,
		image.height,
		100,
		imageContainerHeight
	);

	const handleImageLoad = (event) => {
		const imageInfo = event.detail.images[0];
		images.update((imgs) => {
			imgs[id].pixels = imageInfo.pixels;
			imgs[id].width = imageInfo.width;
			imgs[id].height = imageInfo.height;

			return imgs;
		});
	};
</script>

<div class="image-block">
	<div class="id">
		{id + ($watchModelDescriptor.fileType.imageCountOffset || 0)}
		<OpenImageButton on:imageLoad={handleImageLoad}>R</OpenImageButton>
	</div>
	<div class="image-container" bind:clientHeight={imageContainerHeight}>
		<div
			class="checkered-background"
			style="width: {imageDisplaySize.width}px; height: {imageDisplaySize.height}px"
		>
			<ImageComponent {image} displaySize={imageDisplaySize} />
		</div>
	</div>
	<div class="info">
		<div class="size">{image.width} x {image.height}</div>
		<div class="bits-per-pixel">
			{image.bitsPerPixel}bit {image.pixelFormat
				? image.pixelFormat.toString(16)
				: ""}
		</div>
	</div>
</div>

<style>
	.image-block {
		width: 100px;
		margin: 10px;
		flex-shrink: 0;
		border: 1px solid black;
		display: flex;
		flex-direction: column;
	}

	.image-container {
		flex: 1;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.checkered-background {
		background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKAQMAAAC3/F3+AAAABlBMVEXMzMyAgIDkPTOPAAAAEElEQVQI12P4wYCC2A8gIwCK3gi8+4tyLQAAAABJRU5ErkJggg==);
		background-repeat: repeat, repeat;
	}
</style>
