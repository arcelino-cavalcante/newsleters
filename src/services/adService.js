import adsData from '../data/ads.json';
import { githubService } from './githubService';

const OPTIMISTIC_KEY = 'menslog_optimistic_ads';
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
    return [...adsData];
};

const saveOptimisticData = (data) => {
    localStorage.setItem(OPTIMISTIC_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
    }));
};

export const adService = {
    async getAllAds() {
        try {
            return getOptimisticData();
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
            const updatedAds = [...getOptimisticData(), newAd];
            await githubService.saveData('ads.json', updatedAds);
            saveOptimisticData(updatedAds);
            return newAd.id;
        } catch (error) {
            console.error("Erro ao criar anúncio:", error);
            throw error;
        }
    },

    async updateAd(id, adData) {
        try {
            const updatedAds = getOptimisticData().map(ad => 
                ad.id === id ? { ...ad, ...adData } : ad
            );
            await githubService.saveData('ads.json', updatedAds);
            saveOptimisticData(updatedAds);
            return id;
        } catch (error) {
            console.error("Erro ao atualizar anúncio:", error);
            throw error;
        }
    },

    async deleteAd(id) {
        try {
            const updatedAds = getOptimisticData().filter(ad => ad.id !== id);
            await githubService.saveData('ads.json', updatedAds);
            saveOptimisticData(updatedAds);
            return id;
        } catch (error) {
            console.error("Erro ao deletar anúncio:", error);
            throw error;
        }
    }
};
