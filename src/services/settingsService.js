import settingsData from '../data/settings.json';
import { githubService } from './githubService';

let localSettings = null;

const getLatestData = () => {
    if (localSettings) return localSettings;
    return settingsData;
};

const updateLocalData = (data) => {
    localSettings = data;
};

export const settingsService = {
    async getGeneralSettings() {
        try {
            return getLatestData();
        } catch (error) {
            console.error("Erro ao buscar configurações:", error);
            return null;
        }
    },

    async updateGeneralSettings(settings) {
        try {
            await githubService.saveData('settings.json', settings);
            updateLocalData(settings);
            return true;
        } catch (error) {
            console.error("Erro ao atualizar configurações:", error);
            throw error;
        }
    }
};
