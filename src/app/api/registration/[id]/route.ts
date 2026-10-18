import { NextRequest } from "next/server";
import { registrationService } from "@/services";
import { requireAdminRequest, apiSuccess, apiError } from "@/lib";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdminRequest("Administrator privileges required.");
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await registrationService.updateRegistration(id, body);
    return apiSuccess({ registration: updated });
  } catch (error: unknown) {
    console.error("Update registration error:", error);
    return apiError(error, 500, "Failed to update registration.");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdminRequest("Administrator privileges required.");
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    await registrationService.deleteRegistration(id);

    return apiSuccess({ message: "Registration record deleted." });
  } catch (error: unknown) {
    console.error("Delete registration error:", error);
    return apiError(error, 500, "Failed to delete registration.");
  }
}
