"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { createCourse } from "../courses.api";
import type { Course } from "../courses.types";
import { CourseForm } from "./course-form";

export function CreateCourseDialog({
  onCreated,
}: {
  onCreated: (course: Course) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          Add course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create course</DialogTitle>
          <DialogDescription>
            Add an academic course for teaching assignments and enrollments.
          </DialogDescription>
        </DialogHeader>
        <CourseForm
          onSaved={(course) => {
            setOpen(false);
            onCreated(course);
          }}
          save={(input) => createCourse(input)}
        />
      </DialogContent>
    </Dialog>
  );
}
