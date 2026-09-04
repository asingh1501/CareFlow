import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { DemoProvider } from "@/components/demo-provider";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.png`;
  return {
    title: { default: "CareFlow AR — Healthcare starts before the appointment", template: "%s · CareFlow AR" },
    description: "A healthcare coordination prototype helping Arkansas patients navigate care, schedule, and arrive prepared.",
    openGraph: { title: "CareFlow AR", description: "Healthcare starts before the appointment.", type: "website", images: [{ url: imageUrl, width: 1734, height: 907, alt: "CareFlow AR — Healthcare starts before the appointment" }] },
    twitter: { card: "summary_large_image", title: "CareFlow AR", description: "Healthcare starts before the appointment.", images: [imageUrl] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
