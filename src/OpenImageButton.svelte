<script>
	export let multiple = undefined;
	import OpenFileButton from "./OpenFileButton.svelte";
	import { createEventDispatcher } from "svelte";
	import { convertDataUrlToImagePixels } from "./utils";
	import { watchModelDescriptor } from "./stores";

	const dispatch = createEventDispatcher();

	const handleFileSelected = (event) => {
		const promises = event.detail.files.map((file) =>
			convertDataUrlToImagePixels(file.data, {
				width: $watchModelDescriptor.screen.width,
				height: $watchModelDescriptor.screen.height,
			}).catch((e) => {
				throw new Error(`Invalid image: ${file.name}`);
			})
		);

		Promise.all(promises).then((images) =>
			dispatch("imageLoad", { images })
		);
	};
</script>

<OpenFileButton
	{multiple}
	accept=".jpg, .jpeg, .png, ,bmp"
	on:fileLoad={(e) => handleFileSelected(e)}
	><slot />
</OpenFileButton>
