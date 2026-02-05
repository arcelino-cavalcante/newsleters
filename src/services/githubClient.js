import { Octokit } from "@octokit/rest";

const GITHUB_TOKEN_KEY = "github_token";
const GITHUB_REPO_KEY = "github_repo";

export const githubClient = {
    // Verificar se está configurado
    isConfigured() {
        return !!localStorage.getItem(GITHUB_TOKEN_KEY) && !!localStorage.getItem(GITHUB_REPO_KEY);
    },

    // Salvar configurações
    configure(token, repoUrl) {
        // repoUrl format: "owner/repo"
        const cleanRepo = repoUrl.replace('https://github.com/', '').replace('.git', '');
        localStorage.setItem(GITHUB_TOKEN_KEY, token);
        localStorage.setItem(GITHUB_REPO_KEY, cleanRepo);
    },

    // Limpar configurações
    logout() {
        localStorage.removeItem(GITHUB_TOKEN_KEY);
        localStorage.removeItem(GITHUB_REPO_KEY);
    },

    getRepoInfo() {
        const repoFull = localStorage.getItem(GITHUB_REPO_KEY);
        if (!repoFull) throw new Error("Repositório não configurado");
        const [owner, repo] = repoFull.split('/');
        return { owner, repo };
    },

    getClient() {
        const token = localStorage.getItem(GITHUB_TOKEN_KEY);
        if (!token) throw new Error("Token não configurado");
        
        return new Octokit({
            auth: token
        });
    },

    // Ler arquivo JSON
    async getJsonFile(path) {
        const { owner, repo } = this.getRepoInfo();
        const octokit = this.getClient();

        try {
            const response = await octokit.repos.getContent({
                owner,
                repo,
                path,
            });

            // Decode content (base64)
            const content = atob(response.data.content);
            return JSON.parse(content);
        } catch (error) {
            console.error(`Erro ao ler ${path}:`, error);
            if (error.status === 404) return null;
            throw error;
        }
    },

    // Salvar arquivo JSON (Commit)
    async saveJsonFile(path, data, message) {
        const { owner, repo } = this.getRepoInfo();
        const octokit = this.getClient();

        // 1. Get current SHA check (se arquivo existe)
        let sha = null;
        try {
            const currentFile = await octokit.repos.getContent({
                owner,
                repo,
                path,
            });
            sha = currentFile.data.sha;
        } catch (e) {
            // Arquivo novo
        }

        // 2. Convert to Base64
        const content = btoa(JSON.stringify(data, null, 2));

        // 3. Commit
        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message: message || `Update ${path}`,
            content,
            sha, // Required if updating
            committer: {
                name: "Admin CMS",
                email: "admin@cms.local"
            }
        });
    }
};
