<script>
    export let images

    import ImageBlock from './ImageBlock.svelte'
</script>

<div class="bar">
    {#each images as image, i}
        <ImageBlock image={image} id={i}/>
    {/each}
</div>

<style>
    .bar {
        display:flex;
    }
</style>