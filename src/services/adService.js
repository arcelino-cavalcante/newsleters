import adsData from '../data/ads.json';
import { githubService } from './githubService';

export const adService = {
    async getAllAds() {
        try {
            return [...adsData];
        } catch (error) {
            console.error("Erro ao buscar anúncios:", error);
            return [];
        }
    },

    async createAd(adData) {
        try {
            const newAd = {
                ...adData,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString()
            };
            const updatedAds = [...adsData, newAd];
            await githubService.saveData('ads.json', updatedAds);
            return newAd.id;
        } catch (error) {
            console.error("Erro ao criar anúncio:", error);
            throw error;
        }
    },

    async updateAd(id, adData) {
        try {
            const updatedAds = adsData.map(ad => 
                ad.id === id ? { ...ad, ...adData } : ad
            );
            await githubService.saveData('ads.json', updatedAds);
            return id;
        } catch (error) {
            console.error("Erro ao atualizar anúncio:", error);
            throw error;
        }
    },

    async deleteAd(id) {
        try {
            const updatedAds = adsData.filter(ad => ad.id !== id);
            await githubService.saveData('ads.json', updatedAds);
            return id;
        } catch (error) {
            console.error("Erro ao deletar anúncio:", error);
            throw error;
        }
    }
};
