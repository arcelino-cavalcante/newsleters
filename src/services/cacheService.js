const CACHE_TTL = 30 * 60 * 1000; // 30 minutos em milissegundos

export const cacheService = {
    /**
     * Salva dados no localStorage com uma chave e timestamp
     */
    set: (key, data) => {
        const cacheItem = {
            data,
            timestamp: Date.now()
        };
        try {
            localStorage.setItem(key, JSON.stringify(cacheItem));
        } catch (error) {
            console.warn("Não foi possível salvar no cache local:", error);
        }
    },

    /**
     * Recupera dados do localStorage se o TTL não expirou e se não for Admin
     * Se for Admin, forçamos retorno null para buscar do servidor sempre.
     */
    get: (key) => {
        // Se estivermos na página de Admin, ignoramos o cache
        if (window.location.pathname.startsWith('/admin')) {
            return null;
        }

        try {
            const itemStr = localStorage.getItem(key);
            if (!itemStr) return null;

            const item = JSON.parse(itemStr);
            const isExpired = Date.now() - item.timestamp > CACHE_TTL;

            if (isExpired) {
                localStorage.removeItem(key);
                return null;
            }

            return item.data;
        } catch (error) {
            return null;
        }
    },

    /**
     * Limpa uma chave específica do cache (útil após criar/editar algo)
     */
    clear: (key) => {
        localStorage.removeItem(key);
    },

    /**
     * Limpa todo o cache gerado pela aplicação
     */
    clearAll: () => {
        const keys = ['posts_cache', 'categories_cache', 'ads_cache', 'settings_cache'];
        keys.forEach(k => localStorage.removeItem(k));
    }
};
