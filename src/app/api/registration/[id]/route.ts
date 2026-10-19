import { NextRequest } from "next/server";
import { registrationService } from "@/services";
import {
  getCurrentUser,
  requireAdminRequest,
  prisma,
  apiSuccess,
  apiError,
} from "@/lib";
import type { UnstructuredRegistrationFormData } from "@/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const user = await getCurrentUser();

    const target = await prisma.registration.findUnique({ where: { id } });
    if (!target) {
      return apiError("Registration not found.", 404);
    }

    const isAdmin = user?.role === "ADMIN";
    const isOwnerBySession =
      user &&
      (target.userId === user.id ||
        target.email.toLowerCase() === user.email.toLowerCase());
    const isOwnerByCode =
      typeof body.registrationCode === "string" &&
      body.registrationCode.trim().toUpperCase() === target.registrationCode;

    if (!isAdmin && !isOwnerBySession && !isOwnerByCode) {
      return apiError("Unauthorized to modify this registration.", 403);
    }

    if (isAdmin) {
      const updated = await registrationService.updateRegistration(id, body);
      return apiSuccess({ registration: updated });
    }

    // Delegate self-service update (cannot self-approve paymentStatus, checkInStatus, or visaApprovalStatus)
    const rawFormData = (body.formData || {}) as UnstructuredRegistrationFormData;
    const safeFormData: UnstructuredRegistrationFormData = {
      ...rawFormData,
    };
    delete safeFormData.visaApprovalStatus;
    delete safeFormData.proofVerified;

    const updated = await registrationService.updateRegistration(id, {
      fullName: body.fullName,
      phone: body.phone,
      affiliation: body.affiliation,
      country: body.country,
      avatarUrl: body.avatarUrl,
      dietaryRequirement: body.dietaryRequirement,
      travelNotes: body.travelNotes,
      needsVisaSupport: body.needsVisaSupport,
      passportNumber: body.passportNumber,
      paperId: body.paperId,
      paperTitle: body.paperTitle,
      formData: safeFormData,
    });

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
