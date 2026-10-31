
import api from "./client";

export interface UnitTestCyclePayload {
  name: string;
  academicYear: string;
  startTestNumber: number;
  endTestNumber: number;
  marksEntryDeadline: string;
  correctionDeadline?: string | null;
  branchId?: string | null;
  semesterId: string;
  maxMarks: number;
  testDate: string;
}

export interface UnitTestExportFilters {
  semesterId?: string;
  branchId?: string;
  subjectId?: string;
  cycleId?: string;
  academicYear?: string;
}

export async function getUnitTestCycles() {
  const response = await api.get("/admin/unit-tests/cycles");
  return response.data;
}

export async function createUnitTestCycle(
  payload: UnitTestCyclePayload,
) {
  const response = await api.post(
    "/admin/unit-tests/cycles",
    payload,
  );

  return response.data;
}

export async function exportUnitTestMarks(
  filters: UnitTestExportFilters = {},
): Promise<Blob> {
  const response = await api.get("/admin/unit-tests/export", {
    params: filters,
    responseType: "blob",
  });

  return response.data;
}


export async function deleteUnitTestCycle(
  id: string,
  confirmMarksDeletion = false,
) {
  const response = await api.delete(
    `/admin/unit-tests/cycles/${encodeURIComponent(id)}`,
    {
      params: confirmMarksDeletion
        ? { confirmMarksDeletion: true }
        : undefined,
    },
  );

  return response.data;
}