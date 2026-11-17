
import type { FormEvent } from "react";
import { BookOpen, Save, X } from "lucide-react";

type Branch = {
  id: string;
  name: string;
};

type Semester = {
  id: string;
  number: number;
};

type SubjectFormData = {
  name: string;
  code: string;
  branchId: string;
  semesterId: string;
};

type Props = {
  form: SubjectFormData;
  branches: Branch[];
  semesters: Semester[];
  isEditing: boolean;
  requiresBranch: boolean;
  isCommonSemester: boolean;
  isSaving: boolean;
  branchesLoading: boolean;
  branchesError: boolean;
  semestersLoading: boolean;
  semestersError: boolean;
  onChange: (field: keyof SubjectFormData, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onClear: () => void;
};

const inputClassName =
  "min-h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#921B25] focus:ring-2 focus:ring-red-100 disabled:bg-gray-100";

export default function SubjectForm({
  form,
  branches,
  semesters,
  isEditing,
  requiresBranch,
  isCommonSemester,
  isSaving,
  branchesLoading,
  branchesError,
  semestersLoading,
  semestersError,
  onChange,
  onSubmit,
  onCancel,
  onClear,
}: Props) {
  return (
    <section className="rounded-xl border border-red-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-[#921B25]">
            <BookOpen size={19} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {isEditing ? "Edit Subject" : "Add New Subject"}
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Enter the subject details below.
            </p>
          </div>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            <X size={15} />
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <label
              htmlFor="subject-name"
              className="mb-1.5 block text-xs font-medium text-gray-700"
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
                onChange("name", event.target.value)
              }
              placeholder="Engineering Mathematics"
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="subject-code"
              className="mb-1.5 block text-xs font-medium text-gray-700"
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
                onChange("code", event.target.value.toUpperCase())
              }
              placeholder="MATH101"
              className={`${inputClassName} uppercase`}
            />
          </div>

          <div>
            <label
              htmlFor="subject-semester"
              className="mb-1.5 block text-xs font-medium text-gray-700"
            >
              Semester *
            </label>

            <select
              id="subject-semester"
              required
              value={form.semesterId}
              onChange={(event) =>
                onChange("semesterId", event.target.value)
              }
              disabled={semestersLoading || semestersError}
              className={inputClassName}
            >
              <option value="">Select semester</option>

              {[...semesters]
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
              className="mb-1.5 block text-xs font-medium text-gray-700"
            >
              Branch {requiresBranch ? "*" : "(Common)"}
            </label>

            <select
              id="subject-branch"
              required={requiresBranch}
              value={isCommonSemester ? "" : form.branchId}
              onChange={(event) =>
                onChange("branchId", event.target.value)
              }
              disabled={
                !form.semesterId ||
                branchesLoading ||
                branchesError ||
                isCommonSemester
              }
              className={inputClassName}
            >
              <option value="">
                {isCommonSemester ? "Common subject" : "Select branch"}
              </option>

              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>

            {isCommonSemester && (
              <p className="mt-1 text-xs text-gray-500">
                Semesters 1–2 use common subjects.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isSaving || branchesError || semestersError}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#921B25] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#75151D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={16} />
            {isSaving
              ? "Saving..."
              : isEditing
                ? "Update Subject"
                : "Create Subject"}
          </button>

          {!isEditing && (
            <button
              type="button"
              onClick={onClear}
              className="min-h-10 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Clear Form
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
