import settingsData from '../data/settings.json';
import { githubService } from './githubService';

const OPTIMISTIC_KEY = 'menslog_optimistic_settings';
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
    return settingsData;
};

const saveOptimisticData = (data) => {
    localStorage.setItem(OPTIMISTIC_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
    }));
};

export const settingsService = {
    async getGeneralSettings() {
        try {
            return getOptimisticData();
        } catch (error) {
            console.error("Erro ao buscar configurações:", error);
            return null;
        }
    },

    async updateGeneralSettings(settings) {
        try {
            await githubService.saveData('settings.json', settings);
            saveOptimisticData(settings);
            return true;
        } catch (error) {
            console.error("Erro ao atualizar configurações:", error);
            throw error;
        }
    }
};
