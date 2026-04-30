import { Octokit } from '@octokit/rest';

export const githubService = {
  getCredentials() {
    const token = localStorage.getItem('github_token');
    const owner = localStorage.getItem('github_owner');
    const repo = localStorage.getItem('github_repo');
    return { token, owner, repo };
  },

  async getFileSha(fileName) {
    const { token, owner, repo } = this.getCredentials();
    if (!token || !owner || !repo) throw new Error("Credenciais do GitHub não encontradas.");

    const octokit = new Octokit({ auth: token });
    try {
      const response = await octokit.repos.getContent({
        owner,
        repo,
        path: `src/data/${fileName}`,
      });
      return response.data.sha;
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  },

  async saveData(fileName, data) {
    const { token, owner, repo } = this.getCredentials();
    if (!token || !owner || !repo) throw new Error("Credenciais do GitHub não encontradas.");

    const octokit = new Octokit({ auth: token });
    // Convert to JSON and handle UTF-8 correctly for Base64
    const jsonString = JSON.stringify(data, null, 2);
    const utf8Bytes = new TextEncoder().encode(jsonString);
    const content = btoa(String.fromCharCode(...utf8Bytes));

    const sha = await this.getFileSha(fileName);
    const message = `Update ${fileName}`;

    window.dispatchEvent(new CustomEvent('global-loading', { detail: { isLoading: true, message: 'Enviando alterações...' } }));
    try {
      await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: `src/data/${fileName}`,
      message,
      content,
      sha: sha || undefined,
    });
    } finally {
      window.dispatchEvent(new CustomEvent('global-loading', { detail: { isLoading: false } }));
    }
  },

  async saveRawFile(path, base64Content, message) {
    const { token, owner, repo } = this.getCredentials();
    if (!token || !owner || !repo) throw new Error("Credenciais do GitHub não encontradas.");

    const octokit = new Octokit({ auth: token });
    
    window.dispatchEvent(new CustomEvent('global-loading', { detail: { isLoading: true, message: 'Enviando arquivo...' } }));
    try {
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: base64Content,
      });
    } finally {
      window.dispatchEvent(new CustomEvent('global-loading', { detail: { isLoading: false } }));
    }
  },
  
  async testConnection(token, owner, repo) {
    const octokit = new Octokit({ auth: token });
    try {
        const { data } = await octokit.users.getAuthenticated();
        // Check if repo exists and is accessible
        await octokit.repos.get({ owner, repo });
        return { success: true, user: data.login };
    } catch (error) {
        return { success: false, error: error.message };
    }
  }
};
