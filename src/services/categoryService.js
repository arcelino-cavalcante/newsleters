import { githubClient } from "./githubClient";
import { categories as localCategories } from "../data/posts";

const FILE_PATH = "src/data/categories.json";

export const categoryService = {
    // Buscar todas as categorias
    async getAllCategories() {
        if (!githubClient.isConfigured()) {
            return localCategories.map(c => ({ id: c, name: c, visible: true }));
        }

        try {
            const data = await githubClient.getJsonFile(FILE_PATH);
            // Converter array simples de strings para objetos se necessário, ou manter estrutura
            // O componente espera array de objetos {id, name, visible}
            // Mas nosso JSON é array de strings (simples). Vamos normalizar.

            // Se o JSON for array de strings:
            if (Array.isArray(data) && typeof data[0] === 'string') {
                return data.map(c => ({ id: c, name: c, visible: true }));
            }

            // Se já for objeto (migração futura), retorna direto
            return data || [];
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
            // Fallback
            return localCategories.map(c => ({ id: c, name: c, visible: true }));
        }
    },

    async saveCategories(categoriesList) {
        // Salva apenas os nomes para manter compatibilidade com o formato JSON simples
        // Ou podemos evoluir o JSON para ter metadados. Por enquanto, mantemos simples.
        const simpleList = categoriesList.map(c => c.name);
        await githubClient.saveJsonFile(FILE_PATH, simpleList, "Update categories");
    },

    // Criar categoria
    async createCategory(name) {
        const current = await this.getAllCategories();
        if (current.find(c => c.name === name)) return;

        const newList = [...current, { id: name, name, visible: true }];
        await this.saveCategories(newList);
    },

    // Atualizar (Nome ou Visibilidade)
    async updateCategory(id, data) { // data = { name, visible }
        const current = await this.getAllCategories();
        const newList = current.map(c =>
            c.id === id ? { ...c, ...data, id: data.name || c.id } : c
        );
        await this.saveCategories(newList);
    },

    // Deletar
    async deleteCategory(id) {
        const current = await this.getAllCategories();
        const newList = current.filter(c => c.id !== id);
        await this.saveCategories(newList);
    }
};
