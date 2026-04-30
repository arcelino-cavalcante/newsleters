import adsData from '../data/ads.json';
import { githubService } from './githubService';

let localAds = null;

const getLatestData = () => {
    if (localAds) return localAds;
    return [...adsData];
};

const updateLocalData = (data) => {
    localAds = data;
};

export const adService = {
    async getAllAds() {
        try {
            return getLatestData();
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
            const updatedAds = [...getLatestData(), newAd];
            await githubService.saveData('ads.json', updatedAds);
            updateLocalData(updatedAds);
            return newAd.id;
        } catch (error) {
            console.error("Erro ao criar anúncio:", error);
            throw error;
        }
    },

    async updateAd(id, adData) {
        try {
            const updatedAds = getLatestData().map(ad => 
                ad.id === id ? { ...ad, ...adData } : ad
            );
            await githubService.saveData('ads.json', updatedAds);
            updateLocalData(updatedAds);
            return id;
        } catch (error) {
            console.error("Erro ao atualizar anúncio:", error);
            throw error;
        }
    },

    async deleteAd(id) {
        try {
            const updatedAds = getLatestData().filter(ad => ad.id !== id);
            await githubService.saveData('ads.json', updatedAds);
            updateLocalData(updatedAds);
            return id;
        } catch (error) {
            console.error("Erro ao deletar anúncio:", error);
            throw error;
        }
    }
};
