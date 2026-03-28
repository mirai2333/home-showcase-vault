import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Plus } from "lucide-react";
import Image from "next/image";
import { FilterBar } from "@/components/filter-bar";
import { db } from "@/db";
import { products, categories as categoriesSchema } from "@/db/schema";
import { eq, ilike, and } from "drizzle-orm";

const MOCK_PRODUCTS = [
  { id: "m1", name: "Minimalist Chair", category: "Furniture", categorySlug: "furniture", image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[3/4]" },
  { id: "m2", name: "Ceramic Vase", category: "Decor", categorySlug: "decor", image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[4/5]" },
  { id: "m3", name: "Table Lamp", category: "Lighting", categorySlug: "lighting", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800", aspect: "aspect-square" },
  { id: "m4", name: "Linen Sofa", category: "Furniture", categorySlug: "furniture", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[4/3]" },
  { id: "m5", name: "Wooden Desk", category: "Workspace", categorySlug: "workspace", image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[3/4]" },
];

const MOCK_CATEGORIES = [
  { id: "c1", name: "Furniture", slug: "furniture" },
  { id: "c2", name: "Decor", slug: "decor" },
  { id: "c3", name: "Lighting", slug: "lighting" },
  { id: "c4", name: "Workspace", slug: "workspace" },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.toLowerCase() : "";
  const categorySlug = typeof params.category === "string" ? params.category : "";

  let displayProducts = MOCK_PRODUCTS;
  let categoriesData = MOCK_CATEGORIES;
  let usingRealDB = false;

  if (process.env.DATABASE_URL) {
    try {
      usingRealDB = true;
      categoriesData = await db.select().from(categoriesSchema);

      const conditions = [];

      if (q) {
        conditions.push(ilike(products.name, `%${q}%`));
      }

      if (categorySlug) {
        const category = categoriesData.find((c) => c.slug === categorySlug);
        if (category) {
          conditions.push(eq(products.categoryId, category.id));
        }
      }

      const query = db
        .select({
          id: products.id,
          name: products.name,
          categoryName: categoriesSchema.name,
          categorySlug: categoriesSchema.slug,
          image: products.imageUrl,
        })
        .from(products)
        .leftJoin(categoriesSchema, eq(products.categoryId, categoriesSchema.id));

      if (conditions.length > 0) {
        query.where(and(...conditions));
      }

      const results = await query;
      
      // Map DB results to match UI shape
      displayProducts = results.map((r) => ({
        id: r.id,
        name: r.name,
        category: r.categoryName || "Uncategorized",
        categorySlug: r.categorySlug || "",
        image: r.image || "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=800",
        aspect: "aspect-[3/4]", // We can randomize or store in DB later
      }));
    } catch (e) {
      console.error("Failed to connect to real DB, falling back to mock", e);
      usingRealDB = false;
    }
  }

  // Filter mock data if we're not using real DB
  if (!usingRealDB) {
    displayProducts = MOCK_PRODUCTS.filter((p) => {
      const matchQ = q ? p.name.toLowerCase().includes(q) : true;
      const matchCat = categorySlug ? p.categorySlug === categorySlug : true;
      return matchQ && matchCat;
    });
  }

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
        <div className="mb-12">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif mb-6 text-foreground leading-tight">
            Curated elegance.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-sans max-w-2xl leading-relaxed">
            Your personal catalog for exquisitely designed objects, beautifully structured and accessible.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <FilterBar categories={categoriesData} />

        {/* Asymmetrical Grid Layout */}
        {displayProducts.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8 mt-8">
            {displayProducts.map((product, index) => (
              <div
                key={product.id}
                className="break-inside-avoid group cursor-pointer"
              >
                <div className={`relative w-full ${product.aspect} rounded-2xl overflow-hidden bg-muted shadow-sm transition-all duration-500 hover:shadow-xl`}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    unoptimized
                    priority={index < 2}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
        ) : (
          <div className="py-24 text-center">
            <h3 className="text-2xl font-serif text-foreground mb-3">No objects found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </section>
    </main>
  );
}
