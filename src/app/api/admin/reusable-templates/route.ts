import { Prisma } from "@prisma/client";
import { prisma, requireAdminRequest, apiSuccess, apiError } from "@/lib";
import { isReusableContent, isValidReusableName, MAX_REUSABLE_BYTES, REUSABLE_TEMPLATE_CATEGORY } from "@/modules/website-builder/utils/reusable-templates";

export async function GET() {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;
  try {
    const entries = await prisma.websiteTemplate.findMany({ where: { category: REUSABLE_TEMPLATE_CATEGORY }, orderBy: { updatedAt: "desc" }, take: 200, select: { id: true, name: true, description: true, content: true, updatedAt: true } });
    return apiSuccess({ templates: entries.filter((entry) => isReusableContent(entry.content)) });
  } catch (error) { return apiError(error, 500, "Failed to load reusable templates"); }
}

export async function POST(request: Request) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_REUSABLE_BYTES) return apiError("Template is larger than 2 MB", 413);
    let body: unknown;
    try { body = JSON.parse(raw); } catch { return apiError("Invalid JSON", 400); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return apiError("Invalid template", 400);
    const { name, description, content } = body as Record<string, unknown>;
    if (!isValidReusableName(name)) return apiError("Enter a name of up to 100 characters", 400);
    if (description !== undefined && (typeof description !== "string" || description.length > 500)) return apiError("Description must be at most 500 characters", 400);
    if (!isReusableContent(content)) return apiError("Invalid reusable template content", 400);
    // The value came from JSON.parse and passed the reusable-content shape check above.
    const template = await prisma.websiteTemplate.create({ data: { name: name.trim(), description: typeof description === "string" ? description.trim() : "", category: REUSABLE_TEMPLATE_CATEGORY, content: content as unknown as Prisma.InputJsonValue }, select: { id: true, name: true, description: true, content: true, updatedAt: true } });
    return apiSuccess({ template }, 201);
  } catch (error) { return apiError(error, 500, "Failed to save reusable template"); }
}
