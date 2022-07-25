<script>
	import ResourceImagesBar from "./ResourceImagesBar.svelte";
	import ToolBar from "./ToolBar.svelte";
	import PreviewTab from "./PreviewTab.svelte";
	import { parametersJson, errorMessage } from "./stores";
</script>

<svelte:head>
	<title>Watchface web editor</title>
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"
		integrity="sha512-KfkfwYDsLkIlwQp6LFnl8zNdLGxu9YAA1QvwINks4PhcElQSvqcyVLLD9aMhXd13uQjoXtEKNosOWaZqXgel0g=="
		crossorigin="anonymous"
		referrerpolicy="no-referrer"
	/>
</svelte:head>

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
				<div class="message-bar">
					<div class="error-message">{$errorMessage}</div>
				</div>
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
		margin-right: 3px;
		display: flex;
		flex-direction: column;
	}
	.json-text-area {
		padding: 0.5em;
		margin: 0;
		overflow: auto;
		outline: none;
		flex-grow: 1;
	}
	.message-bar {
		height: 2em;
		padding-left: 1em;
		line-height: 2em;
		flex-shrink: 0;
		box-shadow: 0 -3px 10px #00000020;
	}

	.error-message {
		color: #b80909;
	}

	:global(button) {
		border-width: 0;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		padding-left: 0.75rem;
		padding-right: 0.75rem;
		margin: 0;
		background-color: transparent;
		line-height: 1rem;
		color: #303030;
		background-color: white;
		box-shadow: inset 0 0 0 1px #bfbfbf;
		justify-content: center;
		align-items: center;
		font-size: 0.875rem;
		border-radius: 0.25rem;
	}
</style>
