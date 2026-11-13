import type { Metadata } from "next";
import { AutomatedDemo } from "@/components/automated-demo";

export const metadata: Metadata = {
  title: "Experience CareFlow",
  description: "Watch CareFlow demonstrate its real patient workflows in approximately 40 seconds.",
};

export default function DemoPage() {
  return <AutomatedDemo />;
}
