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