import postsData from '../data/posts.json';
import { githubService } from './githubService';

const OPTIMISTIC_KEY = 'menslog_optimistic_posts';
const OPTIMISTIC_TTL = 5 * 60 * 1000; // 5 minutos (tempo médio de deploy do GitHub Actions)

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
    return [...postsData];
};

const saveOptimisticData = (data) => {
    localStorage.setItem(OPTIMISTIC_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
    }));
};

export const postService = {
    async getPostsPaginated(limitCount = 6, category = 'Todos', lastVisibleDate = null) {
        try {
            let filteredPosts = getOptimisticData();
            
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
            let allPosts = getOptimisticData();
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
            
            const updatedPosts = [...getOptimisticData(), newPost];
            await githubService.saveData('posts.json', updatedPosts);
            saveOptimisticData(updatedPosts);
            return newPost.id;
        } catch (error) {
            console.error("Erro ao criar post:", error);
            throw error;
        }
    },

    async updatePost(id, postData) {
        try {
            const updatedPosts = getOptimisticData().map(post => 
                post.id === id ? { ...post, ...postData } : post
            );
            await githubService.saveData('posts.json', updatedPosts);
            saveOptimisticData(updatedPosts);
            return id;
        } catch (error) {
            console.error("Erro ao atualizar post:", error);
            throw error;
        }
    },

    async deletePost(id) {
        try {
            const updatedPosts = getOptimisticData().filter(post => post.id !== id);
            await githubService.saveData('posts.json', updatedPosts);
            saveOptimisticData(updatedPosts);
            return id;
        } catch (error) {
            console.error("Erro ao deletar post:", error);
            throw error;
        }
    }
};
