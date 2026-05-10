
import { ref } from 'vue';

import { ClientService } from "@/services/index.js";
export function useProducts() {
    const products = ref([]);
    const isLoading = ref(false);

    const getProductsFromBackend = async () => {
        try {
            isLoading.value = true;
            const response = await ClientService.getProduct();
            return products.value = response.data.products;
        } catch (error) {
            return false;
            console.log("Error", error);
        } finally {
            isLoading.value = false;
        }
    };

    return {
        products,
        isLoading,
        getProductsFromBackend,
    };
}
