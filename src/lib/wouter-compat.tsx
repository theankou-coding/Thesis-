"use client";

import NextLink, { type LinkProps as NextLinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AnchorHTMLAttributes, PropsWithChildren } from "react";

type LinkProps = NextLinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps>;

export function Link(props: PropsWithChildren<LinkProps>) {
  return <NextLink {...props} />;
}

export function useLocation(): [string, (to: string) => void] {
  const pathname = usePathname() || "/";
  const router = useRouter();

  return [pathname, (to: string) => router.push(to)];
}

export function Switch({ children }: PropsWithChildren) {
  return <>{children}</>;
}

export function Route() {
  return null;
}
