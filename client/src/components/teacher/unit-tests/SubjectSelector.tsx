
type SubjectSelectorProps = {
  selectedSubject: string;
  selectedCycle: string;
  groups: {
    key: string;
    label: string;
  }[];
  studentsCount: number;
  testsCount: number;
  onSelectionChange: (
    subjectId: string,
    cycleId: string
  ) => void;
};

export default function SubjectSelector({
  selectedSubject,
  selectedCycle,
  groups,
  studentsCount,
  testsCount,
  onSelectionChange,
}: SubjectSelectorProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
      <label className="block text-sm font-semibold text-gray-700">
        Subject / Semester / Academic Year
      </label>

      <select
        value={`${selectedSubject}|${selectedCycle}`}
        onChange={(event) => {
          const [subjectId, cycleId] =
            event.target.value.split("|");

          onSelectionChange(subjectId, cycleId);
        }}
        disabled={!groups.length}
        className="mt-2 w-full max-w-2xl rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-700"
      >
        {groups.map((group) => (
          <option key={group.key} value={group.key}>
            {group.label}
          </option>
        ))}
      </select>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
        <span className="rounded-full bg-gray-100 px-3 py-1">
          {studentsCount} students
        </span>

        <span className="rounded-full bg-gray-100 px-3 py-1">
          {testsCount} Unit Tests available
        </span>
      </div>
    </section>
  );
}
