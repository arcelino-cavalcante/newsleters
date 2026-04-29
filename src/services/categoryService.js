import categoriesData from '../data/categories.json';
import { githubService } from './githubService';

export const categoryService = {
    async getAllCategories() {
        try {
            return [...categoriesData];
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
            const updatedCategories = [...categoriesData, newCategory];
            await githubService.saveData('categories.json', updatedCategories);
            return newCategory.id;
        } catch (error) {
            console.error("Erro ao criar categoria:", error);
            throw error;
        }
    },

    async updateCategory(id, categoryData) {
        try {
            const updatedCategories = categoriesData.map(cat => 
                cat.id === id ? { ...cat, ...categoryData } : cat
            );
            await githubService.saveData('categories.json', updatedCategories);
            return id;
        } catch (error) {
            console.error("Erro ao atualizar categoria:", error);
            throw error;
        }
    },

    async deleteCategory(id) {
        try {
            const updatedCategories = categoriesData.filter(cat => cat.id !== id);
            await githubService.saveData('categories.json', updatedCategories);
            return id;
        } catch (error) {
            console.error("Erro ao deletar categoria:", error);
            throw error;
        }
    }
};
