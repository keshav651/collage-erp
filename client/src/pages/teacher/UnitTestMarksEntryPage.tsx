import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import {
    getTeacherUnitTests,
    getUnitTestMarks,
    saveUnitTestMarks,
} from "../../api/teacherUnitTestsApi";
import MarksEntryHeader from "../../components/teacher/unit-tests/MarksEntryHeader";
import SubjectSelector from "../../components/teacher/unit-tests/SubjectSelector";
import MarksEntryAlerts from "../../components/teacher/unit-tests/MarksEntryAlerts";
import MarksEntryRules from "../../components/teacher/unit-tests/MarksEntryRules";
import MarksEntryTable from "../../components/teacher/unit-tests/MarksEntryTable";

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
    fatherName: string | number;
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
            const label = `${test.subject.name} — Semester ${test.cycle.semester?.number ?? "?"
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
            String(a.name).localeCompare(String(b.name), undefined, {
                numeric: false,
                sensitivity: "base",
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
            <MarksEntryHeader />

            <main className="mx-auto max-w-[1600px] space-y-5 px-4 py-6 sm:px-6">

                <SubjectSelector
                    selectedSubject={selectedSubject}
                    selectedCycle={selectedCycle}
                    groups={groups}
                    studentsCount={students.length}
                    testsCount={sortedTests.length}
                    onSelectionChange={(subjectId, cycleId) => {
                        setSelectedSubject(subjectId);
                        setSelectedCycle(cycleId);
                        setSheet({});
                        setMessage("");
                        setError("");
                    }}
                />



                <MarksEntryAlerts
                    message={message}
                    error={error}
                    testsLoading={testsLoading}
                    testsError={testsError}
                    testsCount={tests.length}
                    groupsCount={groups.length}
                    marksLoading={marksQueries.isLoading}
                    marksError={marksQueries.isError}
                    hasSelectedTests={sortedTests.length > 0}
                    onRetryTests={() => void refetchTests()}
                />


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
                        <MarksEntryRules />

                        <MarksEntryTable
                            selectedGroupLabel={selectedGroup?.label ?? ""}
                            sortedTests={sortedTests}
                            students={students}
                            sheet={sheet}
                            saving={saving}
                            onUpdateCell={updateCell}
                            onSave={() => void handleSave()}
                        />

                    </>
                )}
            </main>
        </div>
    );
}
