
import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import prisma from "../../config/prisma.js";

import {
    createStudentSchema,
    updateStudentSchema,
} from "./students.validation.js";

import {
    listStudents,
    getStudentById,
    createStudent,
    updateStudent,
    setStudentStatus,
} from "./students.service.js";

// Validate student ID from route params
const check_StudentId = (studentId: string | string[]): string => {
    if (typeof studentId !== "string" || !studentId.trim()) {
        throw new Error("Invalid student ID");
    }

    return studentId;
};

// GET /api/students
export const getStudents = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const students = await listStudents();

        return res.status(200).json({
            success: true,
            data: students,
        });
    } catch (error) {
        return next(error);
    }
};

// GET /api/students/:id
export const getStudentbusingId = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const studentId = check_StudentId(req.params.id);

        const student = await getStudentById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: student,
        });
    } catch (error) {
        return next(error);
    }
};

// POST /api/students
export const creatingStudent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = createStudentSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.issues,
            });
        }

        const { branchId, semesterId, rollNo, name } = result.data;

        const [branch, semester] = await Promise.all([
            prisma.branch.findUnique({
                where: { id: branchId },
            }),
            prisma.semester.findUnique({
                where: { id: semesterId },
            }),
        ]);

        if (!branch || !semester) {
            return res.status(400).json({
                success: false,
                message: "Invalid branchId or semesterId",
            });
        }

        const student = await createStudent({
            rollNo,
            name,
            branchId,
            semesterId,
        });

        return res.status(201).json({
            success: true,
            message: "Student created successfully",
            data: student,
        });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return res.status(409).json({
                success: false,
                message: "Roll number already exists",
            });
        }

        return next(error);
    }
};

// PATCH /api/students/:id
export const updatingStudent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const studentId = check_StudentId(req.params.id);

        const result = updateStudentSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.issues,
            });
        }

        const existing = await getStudentById(studentId);

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }

        const data = result.data;

        if (data.branchId) {
            const branch = await prisma.branch.findUnique({
                where: { id: data.branchId },
            });

            if (!branch) {
                return res.status(400).json({
                    success: false,
                    message: "Branch not found",
                });
            }
        }

        if (data.semesterId) {
            const semester = await prisma.semester.findUnique({
                where: { id: data.semesterId },
            });

            if (!semester) {
                return res.status(400).json({
                    success: false,
                    message: "Semester not found",
                });
            }
        }

        const student = await updateStudent(studentId, data);

        return res.status(200).json({
            success: true,
            message: "Student updated successfully",
            data: student,
        });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return res.status(409).json({
                success: false,
                message: "Roll number already exists",
            });
        }

        return next(error);
    }
};

// PATCH /api/students/:id/status
export const updatingStudentStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const studentId = check_StudentId(req.params.id);

        const schema = z.object({
            isActive: z.boolean(),
        });

        const result = schema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "isActive must be a boolean",
                errors: result.error.issues,
            });
        }

        const existing = await getStudentById(studentId);

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }

        const student = await setStudentStatus(
            studentId,
            result.data.isActive
        );

        return res.status(200).json({
            success: true,
            message: "Student status updated successfully",
            data: student,
        });
    } catch (error) {
        return next(error);
    }
};
