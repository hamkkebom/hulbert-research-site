import { notFound, redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";
import { getById } from "@/lib/posts";
import { AUTHORS } from "@/lib/site";
import { Editor } from "@/components/admin/Editor";

export const dynamic = "force-dynamic";

export default async function EditPost({ params }: PageProps<"/admin/posts/[id]">) {
  if (!(await currentAdmin())) redirect("/admin/login");
  const id = Number((await params).id);
  const post = Number.isSafeInteger(id) ? await getById(id) : null;
  if (!post) notFound();
  return <Editor initial={post} authors={AUTHORS.map((a) => a.name)} />;
}
