'use client'

import AuthWrapper from "@/components/AuthWrapper/AuthWrapper";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import RootLayout from "@/app/dziennik/layout";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <h1>Home</h1>
  );
}
