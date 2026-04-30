import categoriesData from '../data/categories.json';
import { githubService } from './githubService';

let localCategories = null;

const getLatestData = () => {
    if (localCategories) return localCategories;
    return [...categoriesData];
};

const updateLocalData = (data) => {
    localCategories = data;
};

export const categoryService = {
    async getAllCategories() {
        try {
            return getLatestData();
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
            return [];
        }
    },

    async createCategory(categoryData) {
        try {
            const newCategory = {
                ...categoryData,
                id: crypto.randomUUID()
            };
            const updatedCategories = [...getLatestData(), newCategory];
            await githubService.saveData('categories.json', updatedCategories);
            updateLocalData(updatedCategories);
            return newCategory.id;
        } catch (error) {
            console.error("Erro ao criar categoria:", error);
            throw error;
        }
    },

    async updateCategory(id, categoryData) {
        try {
            const updatedCategories = getLatestData().map(cat => 
                cat.id === id ? { ...cat, ...categoryData } : cat
            );
            await githubService.saveData('categories.json', updatedCategories);
            updateLocalData(updatedCategories);
            return id;
        } catch (error) {
            console.error("Erro ao atualizar categoria:", error);
            throw error;
        }
    },

    async deleteCategory(id) {
        try {
            const updatedCategories = getLatestData().filter(cat => cat.id !== id);
            await githubService.saveData('categories.json', updatedCategories);
            updateLocalData(updatedCategories);
            return id;
        } catch (error) {
            console.error("Erro ao deletar categoria:", error);
            throw error;
        }
    }
};
