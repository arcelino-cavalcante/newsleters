import { storage } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const storageService = {
    /**
     * Uploads a file to Firebase Storage
     * @param {File} file - The file object to upload
     * @param {string} folder - 'images' or 'files'
     * @returns {Promise<string>} - Download URL
     */
    async uploadFile(file, folder = 'images') {
        if (!file) throw new Error("Nenhum arquivo selecionado.");

        try {
            // Create a unique filename: timestamp_originalName
            const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const storageRef = ref(storage, `${folder}/${filename}`);

            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            return downloadURL;
        } catch (error) {
            console.error("Erro no upload:", error);
            throw error;
        }
    }
};
