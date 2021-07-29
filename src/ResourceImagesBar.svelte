<script>
    export let images

    import ResourceImageBlock from './ResourceImageBlock.svelte'
</script>

<div class="bar">
    {#each images as image, i}
        <ResourceImageBlock image={image} id={i}/>
    {/each}
</div>

<style>
    .bar {
        overflow-x:auto;
        display:flex;
        height: 210px;
    }
</style>