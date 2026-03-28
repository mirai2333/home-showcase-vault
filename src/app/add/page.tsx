import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AddForm } from "./add-form";

export default function AddPage() {
  return (
    <main className="flex-1 flex flex-col px-6 py-12 md:px-12 lg:px-24">
      <header className="flex justify-between items-center w-full max-w-screen-md mx-auto mb-16">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-serif text-lg tracking-wide">Back to Vault</span>
        </Link>
        <ThemeToggle />
      </header>

      <section className="w-full max-w-screen-md mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif mb-4 text-foreground leading-tight">
            Curate a new piece.
          </h1>
          <p className="text-muted-foreground font-sans">
            Upload an image or screenshot. We will attempt to auto-fill the details for you.
          </p>
        </div>

        <AddForm />
      </section>
    </main>
  );
}
