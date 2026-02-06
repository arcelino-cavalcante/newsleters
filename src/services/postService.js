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

    // Create new post (Markdown)
    async createPost(postData) {
        if (!githubClient.isConfigured()) {
            throw new Error("GitHub login required to create posts");
        }

        const octokit = githubClient.getClient();
        const { owner, repo } = githubClient.getRepoInfo();

        const slug = postData.slug || postData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
        const filename = `${slug}.md`;
        const path = `${POSTS_DIR}/${filename}`;

        // Construct Markdown content
        const markdown = this.generateMarkdown(postData);

        // Encode to Base64
        const contentEncoded = btoa(unescape(encodeURIComponent(markdown)));

        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message: `Create post: ${postData.title}`,
            content: contentEncoded,
        });

        return postData.slug;
    },

    // Update existing post
    async updatePost(id, postData) {
        // ID in our new system is essentially the SHA, but for updates we rely on the slug/filename
        // In a real-world scenario we should use the SHA to prevent conflicts, 
        // but for this simple helper we will just overwrite based on the file path.
        if (!githubClient.isConfigured()) {
            throw new Error("GitHub login required to update posts");
        }

        const octokit = githubClient.getClient();
        const { owner, repo } = githubClient.getRepoInfo();

        const slug = postData.slug || postData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
        const filename = `${slug}.md`;
        const path = `${POSTS_DIR}/${filename}`;

        // Get current SHA to allow update
        let sha;
        try {
            const currentFile = await octokit.repos.getContent({
                owner,
                repo,
                path
            });
            sha = currentFile.data.sha;
        } catch (e) {
            // File might not exist if slug changed, effectively a create
        }

        const markdown = this.generateMarkdown(postData);
        const contentEncoded = btoa(unescape(encodeURIComponent(markdown)));

        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message: `Update post: ${postData.title}`,
            content: contentEncoded,
            sha: sha // Required for updates
        });

        return slug;
    },

    // Helper to generate Markdown string
    generateMarkdown(post) {
        const frontmatter = [
            '---',
            `title: "${post.title.replace(/"/g, '\\"')}"`,
            `date: "${post.date || new Date().toISOString()}"`,
            `category: "${post.category}"`,
            `readTime: "${post.readTime}"`,
            `excerpt: "${(post.excerpt || '').replace(/"/g, '\\"')}"`,
            `coverImage: "${post.coverImage || ''}"`,
            `status: "${post.status || 'published'}"`,
            `tags: [${(post.tags || []).map(t => `"${t}"`).join(', ')}]`,
            '---',
            ''
        ].join('\n');

        // Handles both array of paragraphs (legacy block editor) and direct string (if we switch to raw md)
        let body = '';
        if (Array.isArray(post.content)) {
            body = post.content.join('\n\n');
        } else {
            body = post.content || '';
        }

        return frontmatter + body;
    },

    async deletePost(id) { console.log("Delete not implemented yet for Markdown"); }
};
