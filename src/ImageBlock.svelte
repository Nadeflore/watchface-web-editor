<script>
	export let image;
	export let id;

	import Image from './Image.svelte'
</script>

<div class="image-block">
	<div class="id">{id}</div>
	<div class="image-container checkered">
		<Image image={image}/>
	</div>
	<div class="info">
		<div class="size">{image.width} x {image.height}</div>
		<div class="bits-per-pixel">{image.bitsPerPixel}bit</div>
		<div class="pixel-format">{image.pixelFormat.toString(16)}</div>
	</div>
</div>

<style>
	.info {
		min-width: 80px;
	}
	.image-container {
		border: 1px solid black;
		display: inline-block;
	}
	
	.checkered {
		background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKAQMAAAC3/F3+AAAABlBMVEXMzMyAgIDkPTOPAAAAEElEQVQI12P4wYCC2A8gIwCK3gi8+4tyLQAAAABJRU5ErkJggg==);
		background-repeat: repeat, repeat;
	}
</style>