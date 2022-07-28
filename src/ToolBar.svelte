<script>
    import { version, homepage } from "./../package.json";
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
    } from "watchface-js/watchFaceBinParser";
    import { convertToBand7 } from "watchface-js/binToZeppOsConverter";
    import { writeImageAutoDetectBestFormat } from "watchface-js/tgaReaderWriter";
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
            console.error(e);
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
            console.error(e);
            errorMessage.set(e);
        }
    }

    function handleConvertToBand7() {
        try {
            const binFile = convertToBand7($parameters, $images)
                .then((binFile) => {
                    startFileDownload(
                        binFile,
                        "application/octet-stream",
                        "watchface_band7.bin"
                    );
                })
                .catch((e) => {
                    console.error(e);
                    errorMessage.set(e);
                });
        } catch (e) {
            console.error(e);
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

    function handleConvertToZeppOs(e) {
        try {
            const zip = new JSZip();
            for (const image of e.detail.images) {
                const tgaImage = writeImageAutoDetectBestFormat(
                    image.pixels,
                    image.width,
                    image.height
                );
                zip.file(`${image.name.split(".")[0]}.tga`, tgaImage);
            }

            zip.generateAsync({ type: "blob" }).then(function (content) {
                startFileDownload(content, "application/zip", "images.zip");
            });
        } catch (e) {
            console.error(e);
            errorMessage.set(e);
        }
    }
</script>

<div class="toolbar">
    <div class="controls">
        <select bind:value={$watchModelDescriptor} class="model-selector">
            {#each models as model}
                <option value={model}>
                    {model.name}
                </option>
            {/each}
        </select>
        <OpenFileButton
            accept=".bin"
            readAsArrayBuffer
            on:fileLoad={handleBinFileLoad}
        >
            <i class="fa-solid fa-folder-open" /> Open bin
        </OpenFileButton>
        <button on:click={handleBinFileExport}>
            <i class="fa-solid fa-file-export" /> Export bin
        </button>
        {#if $watchModelDescriptor?.id == "miband6"}
            <button on:click={handleConvertToBand7}>
                <i class="fa-solid fa-file-arrow-down" /> Convert to band 7
            </button>
        {/if}
        {#if $images.length}
            <button on:click={handleAllImagesExport}>
                <i class="fa-solid fa-images" /> Export all images
            </button>
        {/if}
        <OpenImageButton
            multiple
            limitSize
            on:imageLoad={handleAllImagesImport}
        >
            <i class="fa-solid fa-images" /> Replace all images
        </OpenImageButton>
        <OpenImageButton multiple on:imageLoad={handleConvertToZeppOs}>
            <i class="fa-solid fa-images" /> Convert Images to zepp OS tga (mi band
            7)
        </OpenImageButton>
    </div>
    <div class="info">
        <a href={homepage}>Version {version}</a>
    </div>
</div>

<style>
    .toolbar {
        height: 40 px;
        padding: 2px;
        box-sizing: border-box;
        overflow-x: auto;
        white-space: nowrap;
        background-color: #f5f5f5;
        display: flex;
        justify-content: space-between;
        box-shadow: 0 3px 10px #00000033;
        position: relative;
        z-index: 100;
    }

    .model-selector {
        max-width: 160px;
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

    .info {
        padding-left: 1em;
        line-height: 30px;
    }
</style>
