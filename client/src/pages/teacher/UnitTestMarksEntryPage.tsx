import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, RefreshCw, Save } from "lucide-react";
import { Link } from "react-router-dom";
import {
    getTeacherUnitTests,
    getUnitTestMarks,
    saveUnitTestMarks,
} from "../../api/teacherUnitTestsApi";

type MarkStatus = "PRESENT" | "ABSENT" | "PENDING";

type UnitTest = {
    id: string;
    title: string;
    testNumber: number;
    maxMarks: number;
    testDate?: string;
    subjectId: string;
    subject?: { id: string; name: string; branchId?: string | null };
    cycle?: {
        id: string;
        academicYear: string;
        semesterId: string;
        semester?: { id: string; number: number };
        branchId?: string | null;
    };
};

type Student = {
    id: string;
    rollNo: string | number;
    name: string;
    mark: {
        status: MarkStatus;
        obtainedMarks: number | null;
    };
};

type MarksResponse = {
    success: boolean;
    data: {
        test: UnitTest;
        students: Student[];
    };
};

type CellValue = {
    status: MarkStatus;
    obtainedMarks: string;
};

type SheetData = Record<string, Record<string, CellValue>>;

export default function UnitTestMarksEntryPage() {
    const {
        data: testsResponse,
        isLoading: testsLoading,
        isError: testsError,
        refetch: refetchTests,
    } = useQuery({
        queryKey: ["teacher", "unit-tests"],
        queryFn: getTeacherUnitTests,
        retry: false,
    });

    const tests: UnitTest[] = Array.isArray(testsResponse?.data)
        ? testsResponse.data
        : [];

    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedCycle, setSelectedCycle] = useState("");
    const [sheet, setSheet] = useState<SheetData>({});
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const groups = useMemo(() => {
        const map = new Map<
            string,
            { key: string; label: string; subjectId: string; tests: UnitTest[] }
        >();

        for (const test of tests) {
            if (!test.cycle || !test.subject) continue;

            const key = `${test.subjectId}|${test.cycle.id}`;
            const label = `${test.subject.name} — Semester ${
                test.cycle.semester?.number ?? "?"
            } — ${test.cycle.academicYear}`;

            if (!map.has(key)) {
                map.set(key, {
                    key,
                    label,
                    subjectId: test.subjectId,
                    tests: [],
                });
            }

            map.get(key)!.tests.push(test);
        }

        return [...map.values()]
            .map((group) => ({
                ...group,
                tests: [...group.tests].sort(
                    (a, b) => a.testNumber - b.testNumber
                ),
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [tests]);

    useEffect(() => {
        if (!groups.length) return;

        const exists = groups.some(
            (group) =>
                group.key === `${selectedSubject}|${selectedCycle}` &&
                Boolean(selectedSubject) &&
                Boolean(selectedCycle)
        );

        if (!exists) {
            setSelectedSubject(groups[0].subjectId);
            setSelectedCycle(groups[0].tests[0]?.cycle?.id ?? "");
        }
    }, [groups, selectedSubject, selectedCycle]);

    const selectedGroup = groups.find(
        (group) =>
            group.subjectId === selectedSubject &&
            group.tests[0]?.cycle?.id === selectedCycle
    );

    const sortedTests = [...(selectedGroup?.tests ?? [])].sort(
        (a, b) => a.testNumber - b.testNumber
    );

    const marksQueries = useQuery({
        queryKey: [
            "teacher",
            "unit-test-marks-sheet",
            selectedSubject,
            selectedCycle,
            sortedTests.map((test) => test.id).join(","),
        ],
        enabled: sortedTests.length > 0,
        queryFn: async () => {
            const results = await Promise.all(
                sortedTests.map(async (test) => {
                    const response = (await getUnitTestMarks(
                        test.id
                    )) as MarksResponse;
                    return { testId: test.id, response };
                })
            );

            return results;
        },
        retry: false,
    });

    useEffect(() => {
        if (!marksQueries.data) return;

        const nextSheet: SheetData = {};

        for (const result of marksQueries.data) {
            const testStudents = result.response?.data?.students ?? [];

            for (const student of testStudents) {
                if (!nextSheet[student.id]) nextSheet[student.id] = {};

                nextSheet[student.id][result.testId] = {
                    status: student.mark?.status ?? "PENDING",
                    obtainedMarks:
                        student.mark?.obtainedMarks == null
                            ? ""
                            : String(student.mark.obtainedMarks),
                };
            }
        }

        setSheet(nextSheet);
        setMessage("");
        setError("");
    }, [marksQueries.data]);

    const students = useMemo(() => {
        const byId = new Map<string, Student>();

        for (const result of marksQueries.data ?? []) {
            for (const student of result.response?.data?.students ?? []) {
                if (!byId.has(student.id)) byId.set(student.id, student);
            }
        }

        return [...byId.values()].sort((a, b) =>
            String(a.rollNo).localeCompare(String(b.rollNo), undefined, {
                numeric: true,
            })
        );
    }, [marksQueries.data]);

    function updateCell(
        studentId: string,
        testId: string,
        field: keyof CellValue,
        value: string
    ) {
        setSheet((current) => {
            const previous = current[studentId]?.[testId] ?? {
                status: "PENDING" as MarkStatus,
                obtainedMarks: "",
            };

            const next: CellValue = { ...previous };

            if (field === "status") {
                const status = value as MarkStatus;
                next.status = status;
                if (status !== "PRESENT") next.obtainedMarks = "";
            } else {
                next.obtainedMarks = value;
                next.status =
                    value.trim() === "" ? "PENDING" : "PRESENT";
            }

            return {
                ...current,
                [studentId]: {
                    ...current[studentId],
                    [testId]: next,
                },
            };
        });

        setMessage("");
        setError("");
    }

    async function handleSave() {
        setMessage("");
        setError("");

        if (sortedTests.length === 0) {
            setError("Save karne ke liye koi Unit Test available nahi hai.");
            return;
        }

        setSaving(true);

        try {
            for (const test of sortedTests) {
                const marksForTest: Array<{
                    studentId: string;
                    status: MarkStatus;
                    obtainedMarks: number | null;
                }> = [];

                for (const student of students) {
                    const cell = sheet[student.id]?.[test.id];
                    if (!cell) continue;

                    if (cell.status === "PRESENT") {
                        if (cell.obtainedMarks.trim() === "") {
                            throw new Error(
                                `${student.name}: ${test.title} ke marks enter karo.`
                            );
                        }

                        const value = Number(cell.obtainedMarks);

                        if (
                            !Number.isFinite(value) ||
                            value < 0 ||
                            value > test.maxMarks
                        ) {
                            throw new Error(
                                `${student.name}: ${test.title} ke marks 0 se ${test.maxMarks} ke beech hone chahiye.`
                            );
                        }

                        marksForTest.push({
                            studentId: student.id,
                            status: "PRESENT",
                            obtainedMarks: value,
                        });
                    } else {
                        marksForTest.push({
                            studentId: student.id,
                            status: cell.status,
                            obtainedMarks: null,
                        });
                    }
                }

                if (marksForTest.length > 0) {
                    await saveUnitTestMarks(test.id, {
                        marks: marksForTest,
                    });
                }
            }

            setMessage("All marks successfully save ho gaye.");
            await marksQueries.refetch();
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Marks save nahi ho sake. Please dobara try karein.";

            setError(message);
        } finally {
            setSaving(false);
        }
    }

    const loading = testsLoading || marksQueries.isLoading;
    const loadError = testsError || marksQueries.isError;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-4 sm:px-6">
                    <div>
                        <h1 className="text-xl font-bold text-red-900">
                            Unit Test Marks Entry
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Excel-style subject-wise marks sheet
                        </p>
                    </div>

                    <Link
                        to="/teacher/dashboard"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                        <ArrowLeft size={16} />
                        Dashboard
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-[1600px] space-y-5 px-4 py-6 sm:px-6">
                <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                    <label className="block text-sm font-semibold text-gray-700">
                        Subject / Semester / Academic Year
                    </label>

                    <select
                        value={`${selectedSubject}|${selectedCycle}`}
                        onChange={(event) => {
                            const [subjectId, cycleId] =
                                event.target.value.split("|");
                            setSelectedSubject(subjectId);
                            setSelectedCycle(cycleId);
                            setSheet({});
                            setMessage("");
                            setError("");
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

                    {selectedGroup && (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                            <span className="rounded-full bg-gray-100 px-3 py-1">
                                {students.length} students
                            </span>
                            <span className="rounded-full bg-gray-100 px-3 py-1">
                                {sortedTests.length} Unit Tests available
                            </span>
                        </div>
                    )}
                </section>

                {message && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {testsLoading && (
                    <div className="rounded-xl border bg-white p-8 text-center text-gray-600">
                        <RefreshCw className="mx-auto mb-2 animate-spin" />
                        Loading unit tests...
                    </div>
                )}

                {!testsLoading && testsError && (
                    <div className="rounded-xl border border-red-200 bg-white p-6">
                        <p className="text-sm text-red-800">
                            Unit Tests load nahi ho sake.
                        </p>
                        <button
                            type="button"
                            onClick={() => void refetchTests()}
                            className="mt-3 rounded-lg bg-red-900 px-4 py-2 text-sm font-semibold text-white"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!testsLoading && !testsError && tests.length === 0 && (
                    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                        <h2 className="font-semibold text-gray-800">
                            No Unit Tests found
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Tests appear here when they are assigned to your subjects.
                        </p>
                    </div>
                )}

                {!testsLoading &&
                    !testsError &&
                    tests.length > 0 &&
                    groups.length === 0 && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                            Tests ka response mila, lekin subject/cycle details
                            incomplete hain. API response check karna hoga.
                        </div>
                    )}

                {loading && sortedTests.length > 0 && (
                    <div className="rounded-xl border bg-white p-8 text-center text-gray-600">
                        <RefreshCw className="mx-auto mb-2 animate-spin" />
                        Loading students and marks...
                    </div>
                )}

                {!loading && loadError && sortedTests.length > 0 && (
                    <div className="rounded-xl border border-red-200 bg-white p-6 text-sm text-red-800">
                        Marks sheet load nahi ho saki. Page refresh karke dobara
                        try karein.
                    </div>
                )}

                {!loading && !loadError && sortedTests.length > 0 && (
                    <>
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <h2 className="font-semibold text-gray-900">
                                Marks Entry Rules
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Present students ke marks 0 se us test ke maximum
                                marks tak hone chahiye. Absent aur Pending ke marks
                                blank rahenge.
                            </p>
                        </div>

                        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4">
                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        {selectedGroup?.label}
                                    </h2>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Cells edit karein, phir Save All Marks par
                                        click karein.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => void handleSave()}
                                    disabled={saving || students.length === 0}
                                    className="inline-flex items-center gap-2 rounded-lg bg-red-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Save size={16} />
                                    {saving ? "Saving..." : "Save All Marks"}
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse text-left text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="sticky left-0 z-10 min-w-16 border-b border-r bg-gray-100 px-3 py-3">
                                                S.No.
                                            </th>
                                            <th className="sticky left-16 z-10 min-w-28 border-b border-r bg-gray-100 px-3 py-3">
                                                Roll No.
                                            </th>
                                            <th className="min-w-48 border-b border-r px-3 py-3">
                                                Student Name
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
                                                <td className="sticky left-16 border-b border-r bg-white px-3 py-2.5 font-medium">
                                                    {student.rollNo}
                                                </td>
                                                <td className="border-b border-r px-3 py-2.5 font-medium text-gray-800">
                                                    {student.name}
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
                                                            Number(cell.obtainedMarks) <
                                                                0 ||
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
                                                                        updateCell(
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
                                                                        updateCell(
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
                    </>
                )}
            </main>
        </div>
    );
}
