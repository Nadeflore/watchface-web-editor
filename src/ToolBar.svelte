<script>
    import OpenFileButton from "./OpenFileButton.svelte";
    import OpenImageButton from "./OpenImageButton.svelte";
    import { onMount } from "svelte";
    import JSZip from "jszip";
    import {
        watchModelDescriptor,
        parametersJson,
        parameters,
        images,
        errorMessage,
    } from "./stores";
    import {
        getAvailableModels,
        parseWatchFaceBin,
        writeWatchFaceBin,
    } from "./watchFaceBinParser/watchFaceBinParser";
    import {
        startFileDownload,
        convertImagePixelsToPngDataUrl,
        removePrefixFromDataUrl,
    } from "./utils";

    let models = [];

    onMount(() => {
        models = getAvailableModels();
        watchModelDescriptor.set(models[0]);
    });

    function handleBinFileLoad(event) {
        try {
            const { parameters: parsedParameters, images: parsedImages } =
                parseWatchFaceBin(
                    event.detail.files[0].data,
                    $watchModelDescriptor.fileType
                );
            errorMessage.set(null);
            parametersJson.set(JSON.stringify(parsedParameters, null, 2));
            images.set(parsedImages);
        } catch (e) {
            errorMessage.set(e);
        }
    }

    function handleBinFileExport() {
        try {
            const binFile = writeWatchFaceBin(
                $parameters,
                $images,
                $watchModelDescriptor.fileType
            );
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

    function handleAllImagesImport(e) {
        images.set(e.detail.images);
    }
</script>

<div class="toolbar">
    <select bind:value={$watchModelDescriptor}>
        {#each models as model}
            <option value={model}>
                {model.name}
            </option>
        {/each}
    </select>
    <OpenFileButton
        accept=".bin"
        readAsArrayBuffer
        on:fileLoad={handleBinFileLoad}>Open bin file</OpenFileButton
    >
    <button on:click={handleBinFileExport}>Export bin file</button>
    {#if $images.length}
        <button on:click={handleAllImagesExport}>Export all images</button>
    {/if}
    <OpenImageButton multiple on:imageLoad={handleAllImagesImport}
        >Import images</OpenImageButton
    >
</div>

<style>
    .toolbar {
        height: 50px;
        padding: 2px;
        box-sizing: border-box;
        overflow-x: auto;
        white-space: nowrap;
    }
</style>
