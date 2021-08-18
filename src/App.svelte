<script>
	import ResourceImagesBar from "./ResourceImagesBar.svelte";
	import ToolBar from "./ToolBar.svelte";
	import PreviewTab from "./PreviewTab.svelte";
	import { parametersJson, errorMessage } from "./stores";
</script>

<div class="editor">
	<ToolBar />
	<div class="middle-area">
		<PreviewTab />
		<div class="json-editor">
			<pre
				class="json-text-area"
				contenteditable="true"
				spellcheck="false"
				bind:textContent={$parametersJson}
			/>
			{#if $errorMessage}
				<div class="error-message">{$errorMessage}</div>
			{/if}
		</div>
	</div>

	<ResourceImagesBar />
</div>

<style>
	:global(body) {
		padding: 0;
	}
	.editor {
		height: 100vh;
	}
	.middle-area {
		height: calc(100vh - 30% - 50px);
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
