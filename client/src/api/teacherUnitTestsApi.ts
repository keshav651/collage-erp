import api from "./client";

export async function getTeacherUnitTests() {
  const response = await api.get("/teacher/unit-tests");
  return response.data;
}

export async function getUnitTestMarks(testId: string) {
  const response = await api.get(
    `/teacher/unit-tests/${encodeURIComponent(testId)}/marks`
  );

  return response.data;
}

export async function saveUnitTestMarks(
  testId: string,
  payload: Record<string, unknown>
) {
  const response = await api.patch(
    `/teacher/unit-tests/${encodeURIComponent(testId)}/marks`,
    payload
  );

  return response.data;
}