import { githubClient } from "./githubClient";
import matter from "gray-matter";

const POSTS_DIR = "content/posts";

export const postService = {
    // Buscar todos os posts (Markdown from GitHub)
    async getAllPosts() {
        if (!githubClient.isConfigured()) {
            console.warn("GitHub not configured, returning empty list or local fallback if available");
            return [];
        }

        try {
            // 1. Get list of files in content/posts
            const octokit = githubClient.getClient();
            const { owner, repo } = githubClient.getRepoInfo();

            const response = await octokit.repos.getContent({
                owner,
                repo,
                path: POSTS_DIR,
            });

            const files = Array.isArray(response.data) ? response.data : [];
            const mdFiles = files.filter(f => f.name.endsWith('.md'));

            // 2. Fetch content for each file
            const posts = await Promise.all(mdFiles.map(async (file) => {
                const fileData = await octokit.repos.getContent({
                    owner,
                    repo,
                    path: file.path,
                });

                // Decode content (base64)
                const content = atob(fileData.data.content.replace(/\n/g, ''));

                // Parse Frontmatter
                const { data, content: mdContent } = matter(content);

                // Split markdown content into array of paragraphs for compatibility with current UI
                // (The current UI expects 'content' to be an array of strings/paragraphs)
                const contentArray = mdContent.split('\n\n').filter(p => p.trim() !== '');

                return {
                    id: file.sha, // Use SHA as ID
                    slug: file.name.replace('.md', ''),
                    ...data, // Spread YAML frontmatter (title, date, category, etc.)
                    content: contentArray // content is now the body
                };
            }));

            // Sort by date descending
            return posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        } catch (error) {
            console.error("Erro ao buscar posts do GitHub:", error);
            return [];
        }
    },

    // Create/Update/Delete are now handled by TinaCMS directly via the /admin interface, 
    // so we might not need these methods for the *app* logic anymore, 
    // but we can keep them if we still wanted manual control, 
    // though purely using Tina + GitHub API is safer.
    // For now, we leave them as TODO or deprecated since Tina handles the "Write" part.
    async createPost() { console.log("Use TinaCMS to create posts"); },
    async updatePost() { console.log("Use TinaCMS to update posts"); },
    async deletePost() { console.log("Use TinaCMS to delete posts"); }
};
