<script>
	export let multiple = undefined;
	export let limitSize = false;
	import OpenFileButton from "./OpenFileButton.svelte";
	import { createEventDispatcher } from "svelte";
	import { convertDataUrlToImagePixels } from "./utils";
	import { watchModelDescriptor } from "./stores";

	const dispatch = createEventDispatcher();

	const handleFileSelected = (event) => {
		let maxSize = undefined;
		if (limitSize) {
			maxSize = {
				width: $watchModelDescriptor.screen.width,
				height: $watchModelDescriptor.screen.height,
			};
		}
		const promises = event.detail.files.map((file) =>
			convertDataUrlToImagePixels(file.data, maxSize, file.name).catch(
				(e) => {
					console.error(e);
					throw new Error(`Invalid image: ${file.name}`);
				}
			)
		);

		Promise.all(promises).then((images) =>
			dispatch("imageLoad", { images })
		);
	};
</script>

<OpenFileButton
	{multiple}
	accept=".jpg, .jpeg, .png, .bmp"
	on:fileLoad={(e) => handleFileSelected(e)}
	><slot />
</OpenFileButton>
