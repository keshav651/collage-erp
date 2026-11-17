import Button from "../../../../components/ui/Button";

export interface ApprovedTeacherCredentials {
  name: string;
  email: string;
  teacherCode?: string;
  temporaryPassword?: string;
}

interface Props {
  credentials: ApprovedTeacherCredentials;
  onClose: () => void;
}

export default function TeacherCredentialsModal({
  credentials,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="approved-credentials-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between gap-3">
          <h2
            id="approved-credentials-title"
            className="text-xl font-bold text-gray-800"
          >
            Teacher Approved
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close credentials dialog"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <p className="mt-2 text-sm text-gray-600">
          The teacher has been approved successfully.
          Save the credentials securely.
        </p>

        <div className="mt-5 space-y-3 rounded-xl bg-[#FFF9F7] p-4">
          <div>
            <p className="text-xs font-medium text-gray-500">
              Teacher Name
            </p>
            <p className="break-words font-semibold text-gray-800">
              {credentials.name}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500">
              Email
            </p>
            <p className="break-all font-semibold text-gray-800">
              {credentials.email}
            </p>
          </div>

          {credentials.teacherCode && (
            <div>
              <p className="text-xs font-medium text-gray-500">
                Teacher Code
              </p>
              <p className="font-semibold text-gray-800">
                {credentials.teacherCode}
              </p>
            </div>
          )}

          {credentials.temporaryPassword && (
            <div>
              <p className="text-xs font-medium text-gray-500">
                Temporary Password
              </p>
              <p className="break-all font-semibold text-gray-800">
                {credentials.temporaryPassword}
              </p>
            </div>
          )}
        </div>

        <Button
          onClick={onClose}
          className="mt-5 w-full"
        >
          Done
        </Button>
      </section>
    </div>
  );
}