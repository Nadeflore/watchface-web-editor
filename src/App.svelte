<script>
	import { parseWatchFaceBin, writeWatchFaceBin } from './watchFaceBinParser/watchFaceBinParser'
	import { startFileDownload } from './utils'
	import ResourceImagesBar from './ResourceImagesBar.svelte'
	import ToolBar from './ToolBar.svelte'
	import PreviewTab from './PreviewTab.svelte'

	let parameters = {};
	let images = [];
	let json = "";
	let errorMessage;

	const handleFileLoad = (event) => {
		const {parameters: parsedParameters, images: parsedImages} = parseWatchFaceBin(event.detail.data)
		json = JSON.stringify(parsedParameters, null, 2)
		images = parsedImages
	};

	$: if (json) {
		try {
			parameters = json && JSON.parse(json)
			errorMessage = undefined
		} catch(e) {
			errorMessage = e
		}
	}

	const exportBinFile = () => {
		const binFile = writeWatchFaceBin(parameters, images)
		startFileDownload(binFile, 'application/octet-stream', "watchface.bin");
	}
</script>
<div class="editor">
	<ToolBar on:fileLoad={handleFileLoad} on:click={exportBinFile} showExportButton={parameters}/>
	<div class="middle-area">
		<PreviewTab parameters={parameters} images={images} on:error={(e) => {errorMessage = e.detail.message}}/>
		<div class="json-editor">
			<pre class="json-text-area" contenteditable="true" spellcheck="false" bind:textContent={json}></pre>
			{#if errorMessage}
				<div class="error-message">{errorMessage}</div>
			{/if}
		</div>
	</div>

	<ResourceImagesBar images={images}/>
</div>

<style>
	:global(body) {
		padding: 0;
	}
	.editor {
		height: 100vh;
	}
	.middle-area {
		height: calc(100vh - 210px - 50px);
		display: flex;
	}
	.json-editor {
		height: 100%;
		margin: 0;
		flex-grow: 1;
	}
	.json-text-area {
		height: calc(100% - 50px);
		overflow: auto;
	}
</style>