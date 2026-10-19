import { emailService } from "@/services";
import { prisma, requireAdminRequest, apiSuccess, apiError } from "@/lib";

export async function GET() {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    const templates = await emailService.listTemplates();
    return apiSuccess({ templates });
  } catch (error: unknown) {
    return apiError(error, 500, "Failed to load milestone email templates");
  }
}

export async function PUT(request: Request) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { slug, name, subject, htmlContent, textContent, isActive } = body;

    if (!slug) {
      return apiError("Template slug is required", 400);
    }

    await emailService.ensureMilestoneTemplates();

    const updated = await prisma.emailTemplate.update({
      where: { slug },
      data: {
        ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
        ...(typeof subject === "string" ? { subject } : {}),
        ...(typeof htmlContent === "string" ? { htmlContent } : {}),
        ...(typeof textContent === "string" ? { textContent } : {}),
        ...(typeof isActive === "boolean" ? { isActive } : {}),
      },
    });

    return apiSuccess({ template: updated });
  } catch (error: unknown) {
    return apiError(error, 500, "Failed to update milestone email template");
  }
}
