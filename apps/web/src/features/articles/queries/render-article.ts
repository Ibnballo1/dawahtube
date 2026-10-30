// src/features/articles/queries/render-article.ts
import { compileMDX } from "next-mdx-remote/rsc";
import { articleMdxComponents } from "@core/content/mdx-components";

export async function renderArticleContent(mdxSource: string) {
  const { content, frontmatter } = await compileMDX({
    source: mdxSource,
    components: articleMdxComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [],
        rehypePlugins: [],
      },
    },
  });
  return { content, frontmatter };
}
