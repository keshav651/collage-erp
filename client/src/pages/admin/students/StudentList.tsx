import { GraduationCap } from "lucide-react";
import type { Student } from "../../../api/studentApi";
import StudentCard from "./StudentCard";

interface StudentListProps {
  students: Student[];
  isLoading: boolean;
  isError: boolean;
  search: string;
  onEdit: (student: Student) => void;
  onToggleStatus: (student: Student) => void;
  isUpdatingStatus: boolean;
    onDelete: (student: Student) => void;
  isDeleting: boolean;
   
}

export default function StudentList({
  students,
  isLoading,
  isError,
  search,
  onEdit,
  onToggleStatus,
  isUpdatingStatus,
   onDelete,
  isDeleting,
}: StudentListProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        Loading students...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-sm text-red-600">
        Unable to load students. Please try again later.
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="p-8 text-center">
        <GraduationCap
          size={34}
          className="mx-auto text-gray-300"
        />

        <p className="mt-3 font-semibold text-gray-800">
          No students found
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {search
            ? "Try searching with another name or roll number."
            : "Students returned by the API will appear here."}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {students.map((student) => (
        <StudentCard
          key={student.id}
          student={student}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          isUpdatingStatus={isUpdatingStatus}
           onDelete={onDelete}
    isDeleting={isDeleting}
        />
      ))}
    </div>
  );
}