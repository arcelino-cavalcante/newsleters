const fs = require('fs');
const path = require('path');

// Read posts.json
const postsPath = path.join(__dirname, 'src/data/posts.json');
const rawData = fs.readFileSync(postsPath, 'utf8');
const posts = JSON.parse(rawData);

const outputDir = path.join(__dirname, 'content/posts');

posts.forEach(post => {
    // Generate slug from title or use existing
    let slug = post.slug;
    if (!slug) {
        slug = post.title
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
    }

    const fileName = `${slug}.md`;
    const filePath = path.join(outputDir, fileName);

    // Prepare frontmatter
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

    // Join content lines if array
    let content = '';
    if (Array.isArray(post.content)) {
        content = post.content.join('\n\n');
    } else {
        content = post.content || '';
    }

    fs.writeFileSync(filePath, frontmatter + content);
    console.log(`Created ${fileName}`);
});
