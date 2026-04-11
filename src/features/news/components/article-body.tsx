interface ArticleBodyProps {
  html: string;
}

export function ArticleBody({ html }: ArticleBodyProps) {
  return (
    <div
      className="prose-custom animate-fade-in"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
