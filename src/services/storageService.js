import { githubService } from './githubService';

export const storageService = {
    /**
     * Uploads a file to GitHub via Octokit and stores in public/uploads/
     * @param {File} file - The file object to upload
     * @param {string} folder - 'images' or 'files'
     * @returns {Promise<string>} - Public URL for the uploaded file
     */
    async uploadFile(file, folder = 'images') {
        if (!file) throw new Error("Nenhum arquivo selecionado.");

        try {
            // Create a unique filename
            const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const path = `public/uploads/${folder}/${filename}`;

            // Convert File to Base64
            const base64Content = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const b64 = reader.result.split(',')[1];
                    resolve(b64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            // Upload via Octokit
            await githubService.saveRawFile(path, base64Content, `Upload ${filename} to ${folder}`);

            // Return the relative URL (will be served from public folder)
            return `/uploads/${folder}/${filename}`;
        } catch (error) {
            console.error("Erro no upload:", error);
            throw error;
        }
    }
};
