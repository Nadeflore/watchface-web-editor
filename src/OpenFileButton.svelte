<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let fileInput

    const handleFileSelected = (e) => {
		let file = e.target.files[0];
		let reader = new FileReader();
		reader.readAsArrayBuffer(file);
		reader.onload = (e) => {
			const buffer = e.target.result;
            dispatch("fileLoad", {buffer})
		};
	};

</script>

<button on:click={()=>{fileInput.click()}}><slot></slot></button>

<input type="file" accept=".bin" on:change={(e) => handleFileSelected(e)} bind:this={fileInput} style="display:none"/>