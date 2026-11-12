import { prisma, requireAdminRequest, apiSuccess, apiError } from "@/lib";
import { REUSABLE_TEMPLATE_CATEGORY } from "@/modules/website-builder/utils/reusable-templates";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;
  try {
    const { id } = await params;
    if (!id || id.length > 128) return apiError("Invalid template ID", 400);
    const result = await prisma.websiteTemplate.deleteMany({ where: { id, category: REUSABLE_TEMPLATE_CATEGORY } });
    if (!result.count) return apiError("Template not found", 404);
    return apiSuccess({ deleted: true });
  } catch (error) { return apiError(error, 500, "Failed to delete reusable template"); }
}
