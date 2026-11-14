# 헐버트 연구 보고서 사이트

호머 헐버트 종합 학술 연구 보고서와 칼럼(블로그)을 싣는 사이트입니다. 운영: 함께봄.

- 운영 주소: https://hulbert-research-site.vercel.app
- 구성: Next.js 16 (App Router) · Neon Postgres (싱가포르, aws-ap-southeast-1) · Vercel (함수 리전 sin1)
- 배포: GitHub `main`에 올리면 Vercel이 자동으로 운영 배포합니다. 다른 브랜치는 미리보기 주소로 배포됩니다.

## 주소

| 주소 | 내용 |
|---|---|
| `/` | 보고서 목차와 연표 |
| `/report/<장>` | 보고서 각 장 (`chapter-1`~`chapter-12`, `conclusion`, `appendix-a`~`c`, `references`) |
| `/blog`, `/blog/<slug>` | 칼럼 목록과 글 |
| `/authors/<slug>` | 작성자 소개 |
| `/admin` | 칼럼 관리 (GitHub 로그인, 검색 제외) |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt` | 검색·AI용 파일 |

옛 한 장짜리 주소의 `#위치`로 들어오면 첫 화면이 해당 장으로 넘겨 줍니다(`content/report/hash-map.json`).

## 보고서 고치기

보고서 본문은 코드에 고정돼 있습니다. `content/report/<장>.html`을 고치고, 장 목록·각주·인용 출처는 `content/report/manifest.json`에 있습니다. 내용을 고치면 `lib/site.ts`의 `reportModified` 날짜도 바꿉니다.

## 칼럼

`/admin`에서 씁니다. 임시저장한 글은 공개 화면, 사이트맵, llms.txt 어디에도 나오지 않습니다. 발행하면 바로 나옵니다. 처음 발행한 시각과 글 주소(slug)는 발행 뒤 바뀌지 않습니다(DB 트리거). 작성자는 `lib/site.ts`의 `AUTHORS`에서 고릅니다.

## 환경 변수

이름은 `.env.example`에 있습니다. 값은 Vercel 프로젝트 설정에만 둡니다.

## 개발

```bash
npm install
vercel env pull .env.local   # 그 뒤 SESSION_SECRET, ADMIN_GITHUB_LOGINS를 직접 추가
npm run db:migrate           # db/migrations/*.sql 적용
npm run dev
```
