<script>
    import ResourceImageBlock from "./ResourceImageBlock.svelte";
    import { images } from "./stores";
</script>

<div class="bar">
    {#each $images as image, i}
        <ResourceImageBlock {image} id={i} />
    {/each}
</div>

<style>
    .bar {
        height: 30%;
        overflow-x: auto;
        display: flex;
        background-color: #f5f5f5;
        box-shadow: 0 -3px 10px #00000020;
        position: relative;
        z-index: 2;
    }
</style>
