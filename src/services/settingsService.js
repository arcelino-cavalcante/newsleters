import settingsData from '../data/settings.json';
import { githubService } from './githubService';

export const settingsService = {
    async getGeneralSettings() {
        try {
            return { ...settingsData };
        } catch (error) {
            console.error("Erro ao buscar configurações:", error);
            return null;
        }
    },

    async updateGeneralSettings(settings) {
        try {
            await githubService.saveData('settings.json', settings);
            return true;
        } catch (error) {
            console.error("Erro ao atualizar configurações:", error);
            throw error;
        }
    }
};
