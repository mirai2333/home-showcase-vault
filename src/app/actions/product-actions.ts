"use server";

import { db } from "@/db";
import { products, categories as categoriesSchema } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProduct(data: {
  name: string;
  price?: string;
  category: string;
  description?: string;
  platform?: string;
  shop?: string;
  originalUrl?: string;
  imageUrl?: string;
}) {
  if (!data.name) {
    throw new Error("Name is required");
  }

  try {
    // 1. Find or create category using an upsert (one round trip)
    let categoryId: string | undefined = undefined;
    if (data.category) {
      const slug = data.category.toLowerCase().trim().replace(/\s+/g, "-");
      
      try {
        const result = await db
          .insert(categoriesSchema)
          .values({
            name: data.category,
            slug,
          })
          .onConflictDoUpdate({
            target: categoriesSchema.slug,
            set: { name: data.category }, // Refresh the name if it matches
          })
          .returning();
        
        categoryId = result[0]?.id;
      } catch (catError) {
        console.error("Error handling category:", catError);
        // Fallback or continue without category if it's non-critical, 
        // but here we keep it for consistency
        throw catError;
      }
    }

    // 2. Insert product
    await db.insert(products).values({
      name: data.name,
      description: data.description,
      price: data.price ? data.price : null,
      originalUrl: data.originalUrl,
      imageUrl: data.imageUrl,
      categoryId,
      platform: data.platform,
      shop: data.shop,
    });
  } catch (error) {
    console.error("Detailed product creation error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack trace:", error.stack);
    }
    throw new Error("Failed to create product. The database connection timed out or failed.");
  }

  revalidatePath("/");
  redirect("/");
}
