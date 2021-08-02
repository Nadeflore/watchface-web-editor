import { writable, derived, get } from 'svelte/store';

export const watchModelDescriptor = writable(undefined);
export const images = writable([]);
// Parameters json is the source of truth
export const parametersJson = writable("{}");
// Parameters is computed from json
export const parameters = derived(
    parametersJson,
    $parametersJson => {
        try {
            const newParameters = JSON.parse($parametersJson)
            errorMessage.set(null)
            return newParameters
        } catch (e) {
            errorMessage.set(e)
        }
        return get(parameters)
    }
)

export const errorMessage = writable(null);