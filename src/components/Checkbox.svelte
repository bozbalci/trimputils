<script>
	export let id = null;
	export let checked = null;
	export let label = null;
</script>

<div class="flex items-start">
	<div class="flex items-center h-5">
		<input
			{id}
			bind:checked
			type="checkbox"
			class="w-4- h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
		/>
	</div>
	<label for={id} class="ml-2 text-sm font-medium text-gray-900">{label}</label>
</div>
