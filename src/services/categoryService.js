import categoriesData from '../data/categories.json';
import { githubService } from './githubService';

const OPTIMISTIC_KEY = 'menslog_optimistic_categories';
const OPTIMISTIC_TTL = 5 * 60 * 1000;

const getOptimisticData = () => {
    try {
        const itemStr = localStorage.getItem(OPTIMISTIC_KEY);
        if (itemStr) {
            const item = JSON.parse(itemStr);
            if (Date.now() - item.timestamp < OPTIMISTIC_TTL) {
                return item.data;
            } else {
                localStorage.removeItem(OPTIMISTIC_KEY);
            }
        }
    } catch (e) {
        console.error(e);
    }
    return [...categoriesData];
};

const saveOptimisticData = (data) => {
    localStorage.setItem(OPTIMISTIC_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
    }));
};

export const categoryService = {
    async getAllCategories() {
        try {
            return getOptimisticData();
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
            const updatedCategories = [...getOptimisticData(), newCategory];
            await githubService.saveData('categories.json', updatedCategories);
            saveOptimisticData(updatedCategories);
            return newCategory.id;
        } catch (error) {
            console.error("Erro ao criar categoria:", error);
            throw error;
        }
    },

    async updateCategory(id, categoryData) {
        try {
            const updatedCategories = getOptimisticData().map(cat => 
                cat.id === id ? { ...cat, ...categoryData } : cat
            );
            await githubService.saveData('categories.json', updatedCategories);
            saveOptimisticData(updatedCategories);
            return id;
        } catch (error) {
            console.error("Erro ao atualizar categoria:", error);
            throw error;
        }
    },

    async deleteCategory(id) {
        try {
            const updatedCategories = getOptimisticData().filter(cat => cat.id !== id);
            await githubService.saveData('categories.json', updatedCategories);
            saveOptimisticData(updatedCategories);
            return id;
        } catch (error) {
            console.error("Erro ao deletar categoria:", error);
            throw error;
        }
    }
};
