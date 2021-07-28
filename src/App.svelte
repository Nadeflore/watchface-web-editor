<script>
	import { parseWatchFaceBin, writeWatchFaceBin } from './watchFaceBinParser/watchFaceBinParser'
	import ResourceImagesBar from './ResourceImagesBar.svelte'

	let files;
	let parameters;
	let images = [];
	let href;

	const onFileSelected = (e) => {
		let image = e.target.files[0];
		let reader = new FileReader();
		reader.readAsArrayBuffer(image);
		reader.onload = (e) => {
			const buffer = e.target.result;

			const {parameters: parsedParameters, images: parsedImages} = parseWatchFaceBin(buffer)
			parameters = parsedParameters
			images = parsedImages
		};
	};

	const createFile = () => {
		var data = new Blob([writeWatchFaceBin(parameters, images)], {type: 'application/octet-stream'});
		href = window.URL.createObjectURL(data);
	}
</script>

<input type="file" on:change={(e) => onFileSelected(e)} bind:files />

<ResourceImagesBar images={images}/>

{#if parameters}
	<button on:click={createFile}>Generate bin file</button>
	{#if href}
	<a download="watchface.bin" href={href}>Download</a>
	{/if}

	<pre>{JSON.stringify(parameters, null, 2)}</pre>
{/if}

