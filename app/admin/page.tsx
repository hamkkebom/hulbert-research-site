import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";
import { listAll } from "@/lib/posts";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  const posts = await listAll();
  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="!m-0 text-2xl">칼럼 관리</h1>
        <div className="flex items-center gap-3 text-sm">
          <span>{admin.login}</span>
          <Link href="/" className="underline">
            사이트 보기
          </Link>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="cursor-pointer rounded border px-3 py-1">
              로그아웃
            </button>
          </form>
        </div>
      </div>
      <p className="mt-4">
        <Link href="/admin/posts/new" className="inline-block rounded bg-[#8b6914] px-4 py-2 font-bold !text-white">
          새 글 쓰기
        </Link>
      </p>
      {posts.length === 0 ? (
        <p>아직 쓴 글이 없습니다.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>제목</th>
              <th>상태</th>
              <th>처음 발행</th>
              <th>마지막 수정</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/posts/${p.id}`}>{p.title}</Link>
                  <div className="text-xs opacity-70">/blog/{p.slug}</div>
                </td>
                <td>{p.status === "published" ? "발행됨" : "임시저장"}</td>
                <td>{p.published_at ? formatDate(p.published_at) : "—"}</td>
                <td>{formatDate(p.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
