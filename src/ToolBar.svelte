<script>
    import OpenFileButton from "./OpenFileButton.svelte";
    import { parametersJson, parameters, images, errorMessage } from "./stores";
    import {
        parseWatchFaceBin,
        writeWatchFaceBin,
    } from "./watchFaceBinParser/watchFaceBinParser";
    import { startFileDownload } from "./utils";

    function handleBinFileLoad(event) {
        try {
            const { parameters: parsedParameters, images: parsedImages } =
                parseWatchFaceBin(event.detail.data);
            errorMessage.set(null);
            parametersJson.set(JSON.stringify(parsedParameters, null, 2));
            images.set(parsedImages);
        } catch (e) {
            errorMessage.set(e);
        }
    }

    function handleBinFileExport() {
        try {
            const binFile = writeWatchFaceBin($parameters, $images);
            startFileDownload(
                binFile,
                "application/octet-stream",
                "watchface.bin"
            );
        } catch (e) {
            errorMessage.set(e);
        }
    }
</script>

<div class="toolbar">
    <OpenFileButton
        accept=".bin"
        readAsArrayBuffer
        on:fileLoad={handleBinFileLoad}>Open bin file</OpenFileButton
    >
    <button on:click={handleBinFileExport}>Export bin file</button>
    {#if $images.length}
        <button on:click>Export all images</button>
    {/if}
</div>

<style>
    .toolbar {
        height: 50px;
        padding: 10px;
        box-sizing: border-box;
    }
</style>
