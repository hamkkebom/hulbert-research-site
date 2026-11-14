import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";
import { AUTHORS } from "@/lib/site";
import { Editor } from "@/components/admin/Editor";

export const dynamic = "force-dynamic";

export default async function NewPost() {
  if (!(await currentAdmin())) redirect("/admin/login");
  return <Editor initial={null} authors={AUTHORS.map((a) => a.name)} />;
}
