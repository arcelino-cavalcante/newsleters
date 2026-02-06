import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineConfig({
    branch,
    clientId: process.env.TINA_CLIENT_ID, // Get this from tina.io
    token: process.env.TINA_TOKEN, // Get this from tina.io

    build: {
        outputFolder: "admin",
        publicFolder: "public",
    },
    media: {
        tina: {
            mediaRoot: "uploads",
            publicFolder: "public",
        },
    },
    schema: {
        collections: [
            {
                name: "post",
                label: "Artigos",
                path: "content/posts",
                format: "md",
                ui: {
                    filename: {
                        // if disabled, the editor can not edit the filename
                        readonly: true,
                        slugify: values => {
                            // Values is an object containing all the values of the form. In this case it is {title: '...'}
                            return values.title
                                ?.toLowerCase()
                                .replace(/ /g, '-')
                        },
                    },
                },
                fields: [
                    {
                        type: "string",
                        name: "title",
                        label: "Título",
                        isTitle: true,
                        required: true,
                    },
                    {
                        type: "string",
                        name: "excerpt",
                        label: "Resumo",
                        ui: {
                            component: "textarea"
                        }
                    },
                    {
                        type: "string",
                        name: "category",
                        label: "Categoria",
                        options: [
                            "Documentação",
                            "Disciplina",
                            "Filosofia",
                            "Homens",
                            "Tutoriais",
                            "Productivity",
                            "Gestão",
                            "Outros"
                        ]
                    },
                    {
                        type: "string",
                        name: "readTime",
                        label: "Tempo de Leitura",
                    },
                    {
                        type: "image",
                        name: "coverImage",
                        label: "Imagem de Capa",
                    },
                    {
                        type: "string",
                        name: "date",
                        label: "Data",
                        ui: {
                            component: 'date',
                            dateFormat: 'DD MMM, YYYY'
                        }
                    },
                    {
                        type: "string",
                        name: "status",
                        label: "Status",
                        options: ["published", "draft"],
                    },
                    {
                        type: "string",
                        name: "tags",
                        label: "Tags",
                        list: true
                    },
                    {
                        type: "rich-text",
                        name: "body",
                        label: "Conteúdo",
                        isBody: true,
                    },
                ],
            },
        ],
    },
});
