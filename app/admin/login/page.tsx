import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";

const MESSAGES: Record<string, string> = {
  config: "GitHub 로그인 설정(GITHUB_CLIENT_ID)이 아직 없습니다.",
  rate: "로그인 시도가 너무 많습니다. 15분 뒤에 다시 시도해 주세요.",
  state: "로그인 요청이 만료되었거나 올바르지 않습니다. 다시 시도해 주세요.",
  github: "GitHub에서 로그인 확인을 받지 못했습니다.",
  denied: "관리자로 등록된 GitHub 계정이 아닙니다.",
};

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await currentAdmin()) redirect("/admin");
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? MESSAGES[sp.error] : null;
  return (
    <main className="mx-auto max-w-md py-16">
      <h1 className="!mt-0 text-2xl">관리자 로그인</h1>
      {sp.out && <p>로그아웃했습니다.</p>}
      {error && (
        <p role="alert" className="rounded border border-red-400 p-3 text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
      <p>관리자로 등록된 GitHub 계정으로만 들어올 수 있습니다.</p>
      <a
        href="/api/auth/login"
        className="inline-block rounded bg-[#24292f] px-5 py-3 font-bold !text-white no-underline hover:opacity-90"
      >
        GitHub로 로그인
      </a>
    </main>
  );
}
