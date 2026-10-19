import { storageService } from "@/services";
import { requireAdminRequest, apiSuccess, apiError } from "@/lib";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await context.params;
    const deleted = await storageService.deleteMediaFile(id);
    if (!deleted) {
      return apiError("Media file not found", 404);
    }
    return apiSuccess({ id, deleted: true });
  } catch (error: unknown) {
    return apiError(error, 500, "Failed to delete media file");
  }
}
