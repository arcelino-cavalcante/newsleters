import postsData from '../data/posts.json';
import { githubService } from './githubService';

export const postService = {
    async getPostsPaginated(limitCount = 6, category = 'Todos', lastVisibleDate = null) {
        try {
            let filteredPosts = [...postsData];
            
            if (category !== 'Todos') {
                filteredPosts = filteredPosts.filter(p => p.category === category);
            }
            
            // Ordenar por data decrescente
            filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            let startIndex = 0;
            if (lastVisibleDate) {
                const index = filteredPosts.findIndex(p => p.createdAt === lastVisibleDate);
                if (index !== -1) {
                    startIndex = index + 1;
                }
            }
            
            const paginatedPosts = filteredPosts.slice(startIndex, startIndex + limitCount);
            const newLastVisibleDate = paginatedPosts.length > 0 ? paginatedPosts[paginatedPosts.length - 1].createdAt : null;

            return { posts: paginatedPosts, lastVisibleDate: newLastVisibleDate };
        } catch (error) {
            console.error("Erro ao buscar posts paginados:", error);
            return { posts: [], lastVisibleDate: null };
        }
    },

    async getAllPosts() {
        try {
            let allPosts = [...postsData];
            allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return allPosts;
        } catch (error) {
            console.error("Erro ao buscar todos os posts:", error);
            return [];
        }
    },

    async createPost(postData) {
        try {
            const newPost = {
                ...postData,
                id: crypto.randomUUID(), // Generate a unique ID
                createdAt: new Date().toISOString()
            };
            
            const updatedPosts = [...postsData, newPost];
            await githubService.saveData('posts.json', updatedPosts);
            return newPost.id;
        } catch (error) {
            console.error("Erro ao criar post:", error);
            throw error;
        }
    },

    async updatePost(id, postData) {
        try {
            const updatedPosts = postsData.map(post => 
                post.id === id ? { ...post, ...postData } : post
            );
            await githubService.saveData('posts.json', updatedPosts);
            return id;
        } catch (error) {
            console.error("Erro ao atualizar post:", error);
            throw error;
        }
    },

    async deletePost(id) {
        try {
            const updatedPosts = postsData.filter(post => post.id !== id);
            await githubService.saveData('posts.json', updatedPosts);
            return id;
        } catch (error) {
            console.error("Erro ao deletar post:", error);
            throw error;
        }
    }
};
