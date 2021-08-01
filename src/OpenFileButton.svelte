<script>
	export let accept
	export let readAsArrayBuffer = false
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let fileInput

    const handleFileSelected = (e) => {
		let file = e.target.files[0];
		let reader = new FileReader();
		if (readAsArrayBuffer) {
			reader.readAsArrayBuffer(file)
		} else {
			reader.readAsDataURL(file)
		}
		reader.onload = (e) => {
			const data = e.target.result;
            dispatch("fileLoad", {data})
		};
	};

</script>

<button on:click={()=>{fileInput.click()}}><slot></slot></button>

<input type="file" accept={accept} on:change={(e) => handleFileSelected(e)} bind:this={fileInput} style="display:none"/>