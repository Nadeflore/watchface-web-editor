<script>
	export let image;
	export let id;
	
	import { computeSizeToFitArea } from './utils'

	import Image from './Image.svelte'

	let checkeredBackground
	const imageDisplayAreaWidth = 80
	const imageDisplayAreaHeight = 100

	$: imageDisplaySize = computeSizeToFitArea(image.width, image.height, imageDisplayAreaWidth, imageDisplayAreaHeight)

	$: if (checkeredBackground) {
		checkeredBackground.style.width = imageDisplaySize.width + "px"
		checkeredBackground.style.height = imageDisplaySize.height + "px"
	}

</script>

<div class="image-block">
	<div class="id">{id}</div>
	<div class="image-container">
		<div class="checkered-background" bind:this={checkeredBackground}>
			<Image image={image} displaySize={imageDisplaySize}/>
		</div>
	</div>
	<div class="info">
		<div class="size">{image.width} x {image.height}</div>
		<div class="bits-per-pixel">{image.bitsPerPixel}bit</div>
		<div class="pixel-format">{image.pixelFormat.toString(16)}</div>
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