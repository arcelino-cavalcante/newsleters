import { githubClient } from "./githubClient";

const FILE_PATH = "src/data/settings.json";

const defaultSettings = {
    siteTitle: "O CAMINHO DO HOMEM",
    siteSubtitle: "FILOSOFIA APLICADA"
};

export const settingsService = {
    async getGeneralSettings() {
        if (!githubClient.isConfigured()) {
            return defaultSettings;
        }

        try {
            const data = await githubClient.getJsonFile(FILE_PATH);
            return data || defaultSettings;
        } catch (error) {
            console.warn("Settings not found or check failed, using defaults");
            return defaultSettings;
        }
    },

    async updateGeneralSettings(data) {
        await githubClient.saveJsonFile(FILE_PATH, data, "Update site settings");
    }
};
