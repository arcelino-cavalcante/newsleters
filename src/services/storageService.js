export const storageService = {
    /**
     * Stub for uploadFile to avoid crashing. 
     * Since we are on GitHub Pages + JSON, we don't have a backend for image uploads.
     */
    async uploadFile(file, folder = 'images') {
        alert("Upload de imagens não é suportado (GitHub CMS). Por favor, use URLs de imagens externas.");
        throw new Error("Upload not supported");
    }
};
