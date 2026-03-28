import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Plus } from "lucide-react";
import Image from "next/image";

const MOCK_PRODUCTS = [
  { id: 1, name: "Minimalist Chair", category: "Furniture", image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[3/4]" },
  { id: 2, name: "Ceramic Vase", category: "Decor", image: "https://images.unsplash.com/photo-1581737630739-1667d8cd1144?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[4/5]" },
  { id: 3, name: "Table Lamp", category: "Lighting", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800", aspect: "aspect-square" },
  { id: 4, name: "Linen Sofa", category: "Furniture", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[4/3]" },
  { id: 5, name: "Wooden Desk", category: "Workspace", image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bf?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[3/4]" },
];

export default function Home() {
  return (
    <main className="flex-1 flex flex-col px-6 py-12 md:px-12 lg:px-24">
      <header className="flex justify-between items-center w-full max-w-screen-2xl mx-auto mb-20">
        <h1 className="text-2xl md:text-4xl font-serif font-medium tracking-wide text-primary">
          Showcase Vault
        </h1>
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <Link 
            href="/add" 
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wide">Add Item</span>
          </Link>
        </div>
      </header>

      <section className="w-full max-w-screen-2xl mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif mb-6 text-foreground leading-tight">
            Curated elegance.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-sans max-w-2xl leading-relaxed">
            Your personal catalog for exquisitely designed objects, beautifully structured and accessible.
          </p>
        </div>

        {/* Asymmetrical Grid Layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
          {MOCK_PRODUCTS.map((product) => (
            <div 
              key={product.id} 
              className="break-inside-avoid group cursor-pointer"
            >
              <div className={`relative w-full ${product.aspect} rounded-2xl overflow-hidden bg-muted shadow-sm transition-all duration-500 hover:shadow-xl`}>
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="mt-4 px-1">
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-1">
                  {product.category}
                </p>
                <h3 className="text-lg font-serif text-foreground group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
