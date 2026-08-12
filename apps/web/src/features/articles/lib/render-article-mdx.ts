// src/features/articles/lib/render-article-mdx.ts
//
// Compiles article MDX content server-side with heading anchors.
// rehype-slug generates id="..." on every h2/h3 — using the same
// github-slugger algorithm that extract-toc.ts replicates manually.
// rehype-autolink-headings adds a clickable anchor link icon on hover.
//
// This is the SINGLE place article MDX gets compiled — both the article
// detail page and any preview/admin rendering should import from here,
// so the heading id generation never drifts out of sync with extractToc.

import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { mdxComponents } from "@core/content/mdx-components";

export async function renderArticleMdx(source: string) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              properties: {
                className: ["heading-anchor"],
                ariaLabel: "Link to this section",
              },
              content: {
                type: "element",
                tagName: "svg",
                properties: {
                  width: 16,
                  height: 16,
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: 2,
                  "aria-hidden": "true",
                },
                children: [
                  {
                    type: "element",
                    tagName: "path",
                    properties: {
                      d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
                    },
                    children: [],
                  },
                  {
                    type: "element",
                    tagName: "path",
                    properties: {
                      d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
                    },
                    children: [],
                  },
                ],
              },
            },
          ],
        ],
      },
    },
  });

  return content;
}
