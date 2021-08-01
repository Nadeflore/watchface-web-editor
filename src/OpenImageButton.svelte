<script>
    import OpenFileButton from './OpenFileButton.svelte'
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

	const handleFileSelected = (event) => {
		const imgDataUrl = event.detail.data
		const img = new Image();
		img.onload = function() {
			const canvas = document.createElement('canvas')
			canvas.width = this.width
			canvas.height = this.height
			const context = canvas.getContext('2d')
			context.drawImage(this, 0, 0)
			const pixels = context.getImageData(0, 0, this.width, this.height).data
            dispatch("fileLoad", {pixels, height: this.height, width: this.width})
		}
		img.src = imgDataUrl
	}
</script>

<OpenFileButton accept=".jpg, .jpeg, .png, ,bmp" on:fileLoad={(e) => handleFileSelected(e)}><slot></slot></OpenFileButton>