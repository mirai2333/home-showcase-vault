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
    // 1. Find or create category
    let categoryId: string | undefined = undefined;
    if (data.category) {
      const slug = data.category.toLowerCase().trim().replace(/\s+/g, "-");
      const existing = await db
        .select()
        .from(categoriesSchema)
        .where(eq(categoriesSchema.slug, slug))
        .limit(1);

      if (existing.length > 0) {
        categoryId = existing[0].id;
      } else {
        const inserted = await db
          .insert(categoriesSchema)
          .values({
            name: data.category,
            slug,
          })
          .returning();
        categoryId = inserted[0].id;
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
    console.error("Failed to create product:", error);
    throw new Error("Failed to create product");
  }

  revalidatePath("/");
  redirect("/");
}
