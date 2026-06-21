import { ALL_BOOKS, bookToSlug, slugToBook } from "@/lib/books";
import BookShell from "@/components/BookShell";
import type { Metadata } from "next";

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_BOOKS.map((book) => ({ slug: bookToSlug(book) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = slugToBook(slug);
  return { title: `${book} — KJV Bible` };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = slugToBook(slug);
  return <BookShell book={book} />;
}
