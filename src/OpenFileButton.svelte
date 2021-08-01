<script>
	export let accept;
	export let multiple = undefined;
	export let readAsArrayBuffer = false;
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	let fileInput;

	const handleFileSelected = (e) => {
		const promises = Array.from(e.target.files).map(
			(file) =>
				new Promise((resolve) => {
					let reader = new FileReader();
					if (readAsArrayBuffer) {
						reader.readAsArrayBuffer(file);
					} else {
						reader.readAsDataURL(file);
					}
					reader.onload = (e) => {
						resolve({ name: file.name, data: e.target.result });
					};
				})
		);

		Promise.all(promises).then((files) => dispatch("fileLoad", { files }));
	};
</script>

<button
	on:click={() => {
		fileInput.click();
	}}><slot /></button
>

<input
	type="file"
	{accept}
	{multiple}
	on:change={(e) => handleFileSelected(e)}
	bind:this={fileInput}
	style="display:none"
/>
