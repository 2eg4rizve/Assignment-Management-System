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
import { createSubject } from "../subjects.api";
import type { Subject } from "../subjects.types";
import { SubjectForm } from "./subject-form";
export function CreateSubjectDialog({
  onCreated,
}: {
  onCreated: (subject: Subject) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          Add subject
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create subject</DialogTitle>
          <DialogDescription>
            Add a subject that can be linked to courses and teachers.
          </DialogDescription>
        </DialogHeader>
        <SubjectForm
          save={(input) => createSubject(input)}
          onSaved={(subject) => {
            setOpen(false);
            onCreated(subject);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
