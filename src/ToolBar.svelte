<script>
    export let showExportButton
	import OpenFileButton from './OpenFileButton.svelte'

</script>

<div class="toolbar">
    <OpenFileButton accept=".bin" readAsArrayBuffer on:fileLoad>Open bin file</OpenFileButton>
    {#if showExportButton}
        <button on:click>Export bin file</button>
    {/if}
</div>

<style>
    .toolbar {
		height: 50px;
        padding: 10px;
        box-sizing: border-box;
	}
</style>