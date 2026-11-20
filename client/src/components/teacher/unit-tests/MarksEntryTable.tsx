
type MarkStatus = "PRESENT" | "ABSENT" | "PENDING";

type UnitTest = {
    id: string;
    title: string;
    testNumber: number;
    maxMarks: number;
};

type Student = {
    id: string;
    name: string;
    fatherName: string | number;
};

type CellValue = {
    status: MarkStatus;
    obtainedMarks: string;
};

type SheetData = Record<string, Record<string, CellValue>>;

type MarksEntryTableProps = {
    selectedGroupLabel: string;
    sortedTests: UnitTest[];
    students: Student[];
    sheet: SheetData;
    saving: boolean;
    onUpdateCell: (
        studentId: string,
        testId: string,
        field: keyof CellValue,
        value: string
    ) => void;
    onSave: () => void;
};

export default function MarksEntryTable({
    selectedGroupLabel,
    sortedTests,
    students,
    sheet,
    saving,
    onUpdateCell,
    onSave,
}: MarksEntryTableProps) {
    return (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4">
                <div>
                    <h2 className="font-semibold text-gray-900">
                        {selectedGroupLabel}
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                        Cells edit karein, phir Save All Marks par
                        click karein.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onSave}
                    disabled={saving || students.length === 0}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <span>{saving ? "Saving..." : "Save All Marks"}</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="sticky left-0 z-10 min-w-16 border-b border-r bg-gray-100 px-3 py-3">
                                S.No.
                            </th>

                            <th className="sticky left-16 z-10 min-w-48 border-b border-r bg-gray-100 px-3 py-3">
                                Student Name
                            </th>

                            <th className="min-w-40 border-b border-r px-3 py-3">
                                Father's Name
                            </th>

                            {sortedTests.map((test) => (
                                <th
                                    key={test.id}
                                    className="min-w-40 border-b border-r px-3 py-3 text-center"
                                >
                                    <div>
                                        {test.title ||
                                            `UT-${test.testNumber}`}
                                    </div>

                                    <div className="mt-1 text-xs font-normal text-gray-500">
                                        Max: {test.maxMarks}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {students.map((student, index) => (
                            <tr
                                key={student.id}
                                className="hover:bg-red-50/30"
                            >
                                <td className="sticky left-0 border-b border-r bg-white px-3 py-2.5 text-gray-500">
                                    {index + 1}
                                </td>

                                <td className="sticky left-16 border-b border-r bg-white px-3 py-2.5 font-medium text-gray-800">
                                    {student.name}
                                </td>

                                <td className="border-b border-r px-3 py-2.5 font-medium">
                                    {student.fatherName}
                                </td>

                                {sortedTests.map((test) => {
                                    const cell = sheet[student.id]?.[
                                        test.id
                                    ] ?? {
                                        status: "PENDING" as MarkStatus,
                                        obtainedMarks: "",
                                    };

                                    const invalid =
                                        cell.status === "PRESENT" &&
                                        cell.obtainedMarks.trim() !== "" &&
                                        (!Number.isFinite(
                                            Number(cell.obtainedMarks)
                                        ) ||
                                            Number(cell.obtainedMarks) < 0 ||
                                            Number(cell.obtainedMarks) >
                                                test.maxMarks);

                                    return (
                                        <td
                                            key={test.id}
                                            className="border-b border-r px-2 py-2"
                                        >
                                            <div className="flex min-w-36 flex-col gap-1.5">
                                                <select
                                                    value={cell.status}
                                                    onChange={(event) =>
                                                        onUpdateCell(
                                                            student.id,
                                                            test.id,
                                                            "status",
                                                            event.target.value
                                                        )
                                                    }
                                                    className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-xs"
                                                    aria-label={`${student.name} ${test.title} status`}
                                                >
                                                    <option value="PENDING">
                                                        Pending
                                                    </option>
                                                    <option value="PRESENT">
                                                        Present
                                                    </option>
                                                    <option value="ABSENT">
                                                        Absent
                                                    </option>
                                                </select>

                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={test.maxMarks}
                                                    step="any"
                                                    value={cell.obtainedMarks}
                                                    disabled={
                                                        cell.status !==
                                                        "PRESENT"
                                                    }
                                                    onChange={(event) =>
                                                        onUpdateCell(
                                                            student.id,
                                                            test.id,
                                                            "obtainedMarks",
                                                            event.target.value
                                                        )
                                                    }
                                                    className={`w-full rounded border px-2 py-1.5 text-right outline-none focus:border-red-700 disabled:bg-gray-100 ${
                                                        invalid
                                                            ? "border-red-500 bg-red-50"
                                                            : "border-gray-300"
                                                    }`}
                                                    placeholder={`0–${test.maxMarks}`}
                                                    aria-label={`${student.name} ${test.title} marks`}
                                                />

                                                {invalid && (
                                                    <span className="text-xs text-red-700">
                                                        Max {test.maxMarks}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}

                        {students.length === 0 && (
                            <tr>
                                <td
                                    colSpan={sortedTests.length + 3}
                                    className="px-4 py-10 text-center text-gray-500"
                                >
                                    Is test group ke liye koi eligible
                                    student nahi mila.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="border-t border-gray-200 p-4 text-xs text-gray-500">
                Tip: Horizontal scroll karke sabhi Unit Tests dekhein.
                Marks enter karne ke baad Save All Marks zaroor click
                karein.
            </div>
        </section>
    );
}
