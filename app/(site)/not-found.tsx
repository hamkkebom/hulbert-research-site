import Link from "next/link";

export default function NotFound() {
  return (
    <article>
      <h1>페이지를 찾을 수 없습니다</h1>
      <p>주소가 바뀌었거나 없는 페이지입니다.</p>
      <ul>
        <li>
          <Link href="/">첫 화면(보고서 목차와 연표)</Link>
        </li>
        <li>
          <Link href="/blog">칼럼</Link>
        </li>
      </ul>
    </article>
  );
}
