import type { Metadata } from "next";
import SiteLayout from "./(site)/layout";
import NotFound from "./(site)/not-found";

export const metadata: Metadata = { title: "페이지를 찾을 수 없습니다" };

/** Addresses that match no route at all: same page, inside the site frame. */
export default function GlobalNotFound() {
  return (
    <SiteLayout>
      <NotFound />
    </SiteLayout>
  );
}
