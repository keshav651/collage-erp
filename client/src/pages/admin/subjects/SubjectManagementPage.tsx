import { useEffect, useState, type FormEvent } from "react";
import useBranches from "../../../hooks/useBranches";
import useSemesters from "../../../hooks/useSemesters";
import useSubjects from "../../../hooks/useSubjects";
import useCreateSubject from "../../../hooks/useCreateSubject";
import useUpdateSubject from "../../../hooks/useUpdateSubject";
import useDeleteSubject from "../../../hooks/useDeleteSubject";

import type {
  Subject,
  CreateSubjectPayload,
} from "../../../api/subjectApi";

const initialForm = {
  name: "",
  code: "",
  branchId: "",
  semesterId: "",
};

export default function SubjectManagementPage() {
  const [branchFilter, setBranchFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const branchesQuery = useBranches();
  const semestersQuery = useSemesters();

  const subjectsQuery = useSubjects(
    branchFilter || undefined,
    semesterFilter || undefined
  );

  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const deleteMutation = useDeleteSubject();

  const branches = branchesQuery.data?.data ?? [];
  const semesters = semestersQuery.data?.data ?? [];
  const subjects = subjectsQuery.data?.data ?? [];

  const selectedSemester = semesters.find(
    (semester) => semester.id === form.semesterId
  );

  const requiresBranch =
    selectedSemester !== undefined && selectedSemester.number > 2;

  useEffect(() => {
    if (selectedSemester?.number && selectedSemester.number <= 2) {
      setForm((current) => ({
        ...current,
        branchId: "",
      }));
    }
  }, [selectedSemester?.id, selectedSemester?.number]);

  function resetForm() {
    setForm(initialForm);
    setEditingSubject(null);
  }

  function startEditing(subject: Subject) {
    setEditingSubject(subject);

    setForm({
      name: subject.name,
      code: subject.code,
      branchId: subject.branchId ?? "",
      semesterId: subject.semesterId,
    });

    setMessage("");
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    const payload: CreateSubjectPayload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      semesterId: form.semesterId,
      branchId: form.branchId || null,
    };

    if (!payload.name || !payload.code || !payload.semesterId) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (requiresBranch && !form.branchId) {
      setErrorMessage(
        "Branch selection is required for Semester 3 onwards."
      );
      return;
    }

    try {
      if (editingSubject) {
        await updateMutation.mutateAsync({
          id: editingSubject.id,
          payload,
        });

        setMessage("Subject updated successfully.");
      } else {
        await createMutation.mutateAsync(payload);

        setMessage("Subject created successfully.");
      }

      resetForm();
    } catch (error: unknown) {
      const responseMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error
          ? (
              error as {
                response?: {
                  data?: {
                    message?: string;
                  };
                };
              }
            ).response?.data?.message
          : undefined;

      setErrorMessage(
        responseMessage || "Unable to save subject. Please try again."
      );
    }
  }

  async function handleDelete(subject: Subject) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${subject.name}"?`
    );

    if (!confirmed) return;

    setMessage("");
    setErrorMessage("");

    try {
      await deleteMutation.mutateAsync(subject.id);
      setMessage("Subject deleted successfully.");

      if (editingSubject?.id === subject.id) {
        resetForm();
      }
    } catch (error: unknown) {
      const responseMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error
          ? (
              error as {
                response?: {
                  data?: {
                    message?: string;
                  };
                };
              }
            ).response?.data?.message
          : undefined;

      setErrorMessage(
        responseMessage ||
          "Unable to delete subject. It may be linked to other records."
      );
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="rounded-2xl bg-white p-5 shadow-sm sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-wider text-rose-800">
            Administration
          </p>

          <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Subject Management
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Manage subjects according to branch and semester.
              </p>
            </div>

            <span className="w-fit rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800">
              {subjects.length} subjects displayed
            </span>
          </div>
        </header>

        {/* Feedback */}
        {message && (
          <div
            role="status"
            className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {message}
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {errorMessage}
          </div>
        )}

        {/* Add/Edit Form */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingSubject ? "Edit Subject" : "Add New Subject"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the subject details below.
              </p>
            </div>

            {editingSubject && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label
                  htmlFor="subject-name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Subject Name *
                </label>

                <input
                  id="subject-name"
                  type="text"
                  required
                  maxLength={150}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. Engineering Mathematics"
                  className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-rose-700 focus:ring-2 focus:ring-rose-100"
                />
              </div>

              <div>
                <label
                  htmlFor="subject-code"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Subject Code *
                </label>

                <input
                  id="subject-code"
                  type="text"
                  required
                  maxLength={30}
                  value={form.code}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      code: event.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g. MATH101"
                  className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm uppercase outline-none focus:border-rose-700 focus:ring-2 focus:ring-rose-100"
                />
              </div>

              <div>
                <label
                  htmlFor="subject-semester"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Semester *
                </label>

                <select
                  id="subject-semester"
                  required
                  value={form.semesterId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      semesterId: event.target.value,
                      branchId: "",
                    })
                  }
                  disabled={semestersQuery.isLoading}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-rose-700 focus:ring-2 focus:ring-rose-100"
                >
                  <option value="">Select semester</option>

                  {semesters
                    .slice()
                    .sort((a, b) => a.number - b.number)
                    .map((semester) => (
                      <option key={semester.id} value={semester.id}>
                        Semester {semester.number}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="subject-branch"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Branch {requiresBranch ? "*" : "(Optional)"}
                </label>

                <select
                  id="subject-branch"
                  required={requiresBranch}
                  value={form.branchId}
                  onChange={(event) =>
                    setForm({ ...form, branchId: event.target.value })
                  }
                  disabled={
                    !form.semesterId ||
                    branchesQuery.isLoading ||
                    (!requiresBranch && !!selectedSemester)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-rose-700 focus:ring-2 focus:ring-rose-100 disabled:bg-slate-100"
                >
                  <option value="">
                    {selectedSemester && selectedSemester.number <= 2
                      ? "Common subject"
                      : "Select branch"}
                  </option>

                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>

                {selectedSemester && selectedSemester.number <= 2 && (
                  <p className="mt-1 text-xs text-slate-500">
                    Leave unselected for a common subject.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={
                  isSaving ||
                  branchesQuery.isError ||
                  semestersQuery.isError
                }
                className="rounded-xl bg-rose-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving
                  ? "Saving..."
                  : editingSubject
                    ? "Update Subject"
                    : "Create Subject"}
              </button>

              {!editingSubject && (
                <button
                  type="button"
                  onClick={() => {
                    setForm(initialForm);
                    setMessage("");
                    setErrorMessage("");
                  }}
                  className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear Form
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Filters */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">
            Filter Subjects
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="filter-branch"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Branch
              </label>

              <select
                id="filter-branch"
                value={branchFilter}
                onChange={(event) => setBranchFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm"
              >
                <option value="">All branches</option>

                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="filter-semester"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Semester
              </label>

              <select
                id="filter-semester"
                value={semesterFilter}
                onChange={(event) => setSemesterFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm"
              >
                <option value="">All semesters</option>

                {semesters
                  .slice()
                  .sort((a, b) => a.number - b.number)
                  .map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      Semester {semester.number}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </section>

        {/* Subject List */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Subject List
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View, edit or delete existing subjects.
            </p>
          </div>

          {subjectsQuery.isLoading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading subjects...
            </div>
          ) : subjectsQuery.isError ? (
            <div className="p-6 text-center">
              <p className="text-sm text-red-600">
                Failed to load subjects.
              </p>

              <button
                type="button"
                onClick={() => subjectsQuery.refetch()}
                className="mt-3 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Retry
              </button>
            </div>
          ) : subjects.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-semibold text-slate-700">
                No subjects found
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Add a subject or change the selected filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Subject</th>
                    <th className="px-5 py-4">Code</th>
                    <th className="px-5 py-4">Branch</th>
                    <th className="px-5 py-4">Semester</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {subjects.map((subject) => (
                    <tr
                      key={subject.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {subject.name}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                          {subject.code}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {subject.branch?.name ?? "Common"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {subject.semester?.number
                          ? `Semester ${subject.semester.number}`
                          : semesters.find(
                              (semester) =>
                                semester.id === subject.semesterId
                            )
                            ? `Semester ${
                                semesters.find(
                                  (semester) =>
                                    semester.id === subject.semesterId
                                )!.number
                              }`
                            : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(subject)}
                            className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={deleteMutation.isPending}
                            onClick={() => handleDelete(subject)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}