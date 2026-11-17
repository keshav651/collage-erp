export interface Branch {
  id: string;
  name: string;
  codePrefix?: string;
}
export interface Semester {
  id: string;
  number: number;
}
export interface UnitTestSubject {
  id: string;
  name: string;
  code?: string;
}
export interface UnitTest {
  id: string;
  title: string;
  testNumber: number;
  maxMarks: number;
  testDate: string;
  subject?: UnitTestSubject;
}
export interface UnitTestCycle {
  id: string;
  name: string;
  academicYear: string;
  startTestNumber: number;
  endTestNumber: number;
  marksEntryDeadline: string;
  correctionDeadline?: string | null;
  branchId?: string | null;
  semesterId: string;
  branch?: Branch | null;
  semester?: Semester;
  tests: UnitTest[];
  createdAt: string;
}
export interface CyclesResponse {
  message?: string;
  count: number;
  data: UnitTestCycle[];
}
export interface BranchesResponse {
  success: boolean;
  count: number;
  data: Branch[];
}
export interface CreateCycleResponse {
  message: string;
  data: UnitTestCycle;
  summary?: {
    subjectCount: number;
    testNumbers: number;
    totalTests: number;
  };
}
export interface FormState {
  name: string;
  academicYear: string;
  semesterId: string;
  branchId: string;
  startTestNumber: string;
  endTestNumber: string;
  maxMarks: string;
  testDate: string;
  marksEntryDeadline: string;
  correctionDeadline: string;
}
export interface ExportFilterState {
  semesterId: string;
  branchId: string;
  subjectId: string;
  academicYear: string;
  cycleId: string;
}
export const initialForm: FormState = {
  name: "",
  academicYear: "",
  semesterId: "",
  branchId: "",
  startTestNumber: "1",
  endTestNumber: "3",
  maxMarks: "20",
  testDate: "",
  marksEntryDeadline: "",
  correctionDeadline: "",
};
export const initialExportFilters: ExportFilterState = {
  semesterId: "",
  branchId: "",
  subjectId: "",
  academicYear: "",
  cycleId: "",
};
