<script>
	import { parseWatchFaceBin } from './watchFaceBinParser/watchFaceBinParser'
	import ResourceImagesBar from './ResourceImagesBar.svelte'

	let files;
	let json;
	let images = [];

	const onFileSelected = (e) => {
		let image = e.target.files[0];
		let reader = new FileReader();
		reader.readAsArrayBuffer(image);
		reader.onload = (e) => {
			const buffer = e.target.result;

			const {parameters, images: parsedImages} = parseWatchFaceBin(buffer)
			images = parsedImages

			json = JSON.stringify(parameters, null, 2);
		};
	};
</script>

<input type="file" on:change={(e) => onFileSelected(e)} bind:files />

<ResourceImagesBar images={images}/>

<pre>{json}</pre>
