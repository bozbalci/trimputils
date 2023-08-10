<script>
	export let id = null;
	export let value = null;
	export let label = null;
</script>

<div class="w-full">
	<label for={id} class="block mb-0.5 text-xs font-medium text-gray-900">{label}</label>
	<input
		{id}
		bind:value
		type="number"
		class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-0.5"
	/>
</div>
