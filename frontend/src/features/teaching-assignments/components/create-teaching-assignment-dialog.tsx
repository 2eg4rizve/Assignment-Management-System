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
import { createTeachingAssignment } from "../teaching-assignments.api";
import type { TeachingAssignment } from "../teaching-assignments.types";
import { TeachingAssignmentForm } from "./teaching-assignment-form";
export function CreateTeachingAssignmentDialog({
  onCreated,
}: {
  onCreated: (assignment: TeachingAssignment) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          Add teaching assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create teaching assignment</DialogTitle>
          <DialogDescription>
            Connect a teacher to a course and subject.
          </DialogDescription>
        </DialogHeader>
        <TeachingAssignmentForm
          save={(input) => createTeachingAssignment(input)}
          onSaved={(assignment) => {
            setOpen(false);
            onCreated(assignment);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
