<script>
    import OpenFileButton from "./OpenFileButton.svelte";
    import JSZip from "jszip";
    import { parametersJson, parameters, images, errorMessage } from "./stores";
    import {
        parseWatchFaceBin,
        writeWatchFaceBin,
    } from "./watchFaceBinParser/watchFaceBinParser";
    import {
        startFileDownload,
        convertImagePixelsToPngDataUrl,
        removePrefixFromDataUrl,
    } from "./utils";

    function handleBinFileLoad(event) {
        try {
            const { parameters: parsedParameters, images: parsedImages } =
                parseWatchFaceBin(event.detail.files[0].data);
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

    function handleAllImagesExport() {
        const zip = new JSZip();
        const imagesFolder = zip.folder("images");
        for (const [i, image] of $images.entries()) {
            const base64Image = removePrefixFromDataUrl(
                convertImagePixelsToPngDataUrl(image)
            );
            imagesFolder.file(`${(i + "").padStart(4, "0")}.png`, base64Image, {
                base64: true,
            });
        }
        zip.generateAsync({ type: "blob" }).then(function (content) {
            startFileDownload(content, "application/zip", "images.zip");
        });
    }

    function handleImportImages(e) {}
</script>

<div class="toolbar">
    <OpenFileButton
        accept=".bin"
        readAsArrayBuffer
        on:fileLoad={handleBinFileLoad}>Open bin file</OpenFileButton
    >
    <button on:click={handleBinFileExport}>Export bin file</button>
    {#if $images.length}
        <button on:click={handleAllImagesExport}>Export all images</button>
    {/if}
</div>

<style>
    .toolbar {
        height: 50px;
        padding: 10px;
        box-sizing: border-box;
    }
</style>
