<script>
	import { parseWatchFaceBin, writeWatchFaceBin } from './watchFaceBinParser/watchFaceBinParser'
	import { startFileDownload } from './utils'
	import ResourceImagesBar from './ResourceImagesBar.svelte'
	import ToolBar from './ToolBar.svelte'

	let files;
	let parameters;
	let images = [];
	let href;
	let json;

	const handleFileLoad = (event) => {
		const {parameters: parsedParameters, images: parsedImages} = parseWatchFaceBin(event.detail.buffer)
		parameters = parsedParameters
		json = JSON.stringify(parameters, null, 2)
		images = parsedImages
	};

	const exportBinFile = () => {
		const binFile = writeWatchFaceBin(JSON.parse(json), images)
		startFileDownload(binFile, 'application/octet-stream', "watchface.bin");
	}
</script>
<div class="editor">
	<ToolBar on:fileLoad={handleFileLoad} on:export={exportBinFile} showExportButton={parameters}></ToolBar>

	{#if parameters}
		<pre class="json-editor" contenteditable="true" spellcheck="false" bind:textContent={json}></pre>
	{/if}

	<ResourceImagesBar images={images}/>
</div>

<style>
	:global(body) {
		padding: 0;
	}
	.editor {
		height: 100%;
	}
	.json-editor {
		height: calc(100vh - 210px - 50px);
		margin: 0;
	}
	.json-editor {
		overflow-y:auto;
	}
</style>