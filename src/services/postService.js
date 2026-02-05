import { githubClient } from "./githubClient";
import { posts as localPosts } from "../data/posts";

const FILE_PATH = "src/data/posts.json";

export const postService = {
    // Buscar todos os posts
    async getAllPosts() {
        if (!githubClient.isConfigured()) {
            // Se não configurado, retorna dados locais (leitura apenas)
            return localPosts;
        }

        try {
            const data = await githubClient.getJsonFile(FILE_PATH);
            return data || [];
        } catch (error) {
            console.error("Erro ao buscar posts do GitHub:", error);
            // Fallback para local se erro
            return localPosts;
        }
    },

    // Criar novo post
    async createPost(postData) {
        const posts = await this.getAllPosts();

        const newPost = {
            id: Date.now(), // ID simples baseado em timestamp
            ...postData,
            createdAt: new Date().toISOString()
        };

        const updatedPosts = [newPost, ...posts];
        await githubClient.saveJsonFile(FILE_PATH, updatedPosts, `Create post: ${postData.title}`);
        return newPost.id;
    },

    // Atualizar post existente
    async updatePost(id, postData) {
        const posts = await this.getAllPosts();
        const updatedPosts = posts.map(p =>
            p.id === id ? { ...p, ...postData } : p
        );

        await githubClient.saveJsonFile(FILE_PATH, updatedPosts, `Update post: ${postData.title || id}`);
        return id;
    },

    // Deletar post
    async deletePost(id) {
        const posts = await this.getAllPosts();
        const updatedPosts = posts.filter(p => p.id !== id);

        await githubClient.saveJsonFile(FILE_PATH, updatedPosts, `Delete post: ${id}`);
        return id;
    }
};
