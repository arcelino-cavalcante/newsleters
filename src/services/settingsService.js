import { db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const COLLECTION = "settings";
const DOC_ID = "general";

export const settingsService = {
    // Buscar configurações gerais
    async getGeneralSettings() {
        try {
            const docRef = doc(db, COLLECTION, DOC_ID);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                // Return defaults if not set
                return {
                    siteTitle: "O CAMINHO DO HOMEM",
                    siteSubtitle: "FILOSOFIA APLICADA"
                };
            }
        } catch (error) {
            console.error("Erro ao buscar configurações:", error);
            return {
                siteTitle: "O CAMINHO DO HOMEM",
                siteSubtitle: "FILOSOFIA APLICADA"
            };
        }
    },

    // Atualizar configurações
    async updateGeneralSettings(data) {
        try {
            const docRef = doc(db, COLLECTION, DOC_ID);
            await setDoc(docRef, {
                ...data,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (error) {
            console.error("Erro ao atualizar configurações:", error);
            throw error;
        }
    }
};
