
import { useState, type FormEvent } from "react";

import useBranches from "../../../../hooks/useBranches";
import useCreateBranch from "../../../../hooks/useCreateBranch";

function getErrorMessage(value: unknown): string {
  if (value && typeof value === "object" && "response" in value) {
    const response = value.response;

    if (
      response &&
      typeof response === "object" &&
      "data" in response
    ) {
      const responseData = response.data;

      if (
        responseData &&
        typeof responseData === "object" &&
        "message" in responseData &&
        typeof responseData.message === "string"
      ) {
        return responseData.message;
      }
    }
  }

  if (value instanceof Error) {
    return value.message;
  }

  return "Something went wrong. Please try again.";
}

export default function useBranchManagement() {
  const [name, setName] = useState("");
  const [codePrefix, setCodePrefix] = useState("");

  const {
    data,
    isLoading,
    isError,
    error,
  } = useBranches();

  const createBranchMutation = useCreateBranch();

  const branches = data?.data ?? [];

  const handleCodePrefixChange = (value: string) => {
    setCodePrefix(
      value.toUpperCase().replace(/\s/g, ""),
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedCodePrefix = codePrefix.trim().toUpperCase();

    if (
      !trimmedName ||
      !/^[A-Z0-9]{2,10}$/.test(trimmedCodePrefix)
    ) {
      return;
    }

    createBranchMutation.mutate(
      {
        name: trimmedName,
        codePrefix: trimmedCodePrefix,
      },
      {
        onSuccess: () => {
          setName("");
          setCodePrefix("");
        },
      },
    );
  };

  return {
    name,
    setName,
    codePrefix,
    handleCodePrefixChange,
    branches,
    isLoading,
    isError,
    errorMessage: isError ? getErrorMessage(error) : null,
    handleSubmit,
    isCreating: createBranchMutation.isPending,
    createError: createBranchMutation.isError
      ? getErrorMessage(createBranchMutation.error)
      : null,
    createSuccess: createBranchMutation.isSuccess,
  };
}
