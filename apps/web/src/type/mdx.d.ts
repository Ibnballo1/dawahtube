// src/types/mdx.d.ts
// Type declarations for the 'mdx/types' module.
// next-mdx-remote ships its own types but the base MDXComponents interface
// comes from the 'mdx' package. This declaration file covers the case where
// 'mdx' is not directly installed (it ships as a peer of @mdx-js/react).

declare module "mdx/types" {
  import type * as React from "react";

  /**
   * A map of component names to React components.
   * Passed to compileMDX() / MDXRemote to override default HTML elements
   * and register custom components used in MDX content.
   */
  export type MDXComponents = {
    // Override built-in HTML elements
    a?: React.ComponentType<React.AnchorHTMLAttributes<HTMLAnchorElement>>;
    blockquote?: React.ComponentType<
      React.BlockquoteHTMLAttributes<HTMLElement>
    >;
    br?: React.ComponentType<React.HTMLAttributes<HTMLBRElement>>;
    code?: React.ComponentType<React.HTMLAttributes<HTMLElement>>;
    em?: React.ComponentType<React.HTMLAttributes<HTMLElement>>;
    h1?: React.ComponentType<React.HTMLAttributes<HTMLHeadingElement>>;
    h2?: React.ComponentType<React.HTMLAttributes<HTMLHeadingElement>>;
    h3?: React.ComponentType<React.HTMLAttributes<HTMLHeadingElement>>;
    h4?: React.ComponentType<React.HTMLAttributes<HTMLHeadingElement>>;
    h5?: React.ComponentType<React.HTMLAttributes<HTMLHeadingElement>>;
    h6?: React.ComponentType<React.HTMLAttributes<HTMLHeadingElement>>;
    hr?: React.ComponentType<React.HTMLAttributes<HTMLHRElement>>;
    img?: React.ComponentType<React.ImgHTMLAttributes<HTMLImageElement>>;
    li?: React.ComponentType<React.LiHTMLAttributes<HTMLLIElement>>;
    ol?: React.ComponentType<React.OlHTMLAttributes<HTMLOListElement>>;
    p?: React.ComponentType<React.HTMLAttributes<HTMLParagraphElement>>;
    pre?: React.ComponentType<React.HTMLAttributes<HTMLPreElement>>;
    strong?: React.ComponentType<React.HTMLAttributes<HTMLElement>>;
    table?: React.ComponentType<React.TableHTMLAttributes<HTMLTableElement>>;
    td?: React.ComponentType<React.TdHTMLAttributes<HTMLTableCellElement>>;
    th?: React.ComponentType<React.ThHTMLAttributes<HTMLTableCellElement>>;
    tr?: React.ComponentType<React.HTMLAttributes<HTMLTableRowElement>>;
    ul?: React.ComponentType<React.HTMLAttributes<HTMLUListElement>>;

    // Custom components (any additional JSX elements used in MDX content)
    // These are typed as accepting any props so custom components
    // can define their own prop interfaces.
    [key: string]: React.ComponentType<Record<string, unknown>> | undefined;
  };
}
