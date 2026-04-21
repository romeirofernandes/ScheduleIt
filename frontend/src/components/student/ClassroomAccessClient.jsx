"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  submitLockProof,
  createClassroomAccessRequest,
} from "@/actions/schedule/classroom-access-action";

const STATUS_LABELS = {
  REQUESTED: "Requested",
  APPROVED: "Approved",
  LOCK_PROOF_SUBMITTED: "Proof Submitted",
  LOCK_CONFIRMED: "Lock Confirmed",
  LOCK_REJECTED: "Lock Rejected",
};

function StatusBadge({ status }) {
  const classes = {
    REQUESTED: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    APPROVED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    LOCK_PROOF_SUBMITTED: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    LOCK_CONFIRMED: "bg-green-500/15 text-green-700 dark:text-green-400",
    LOCK_REJECTED: "bg-red-500/15 text-red-700 dark:text-red-400",
  };

  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${classes[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
}

export function ClassroomAccessClient({ initialRequests = [] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [isPending, startTransition] = useTransition();
  const [filesByRequestId, setFilesByRequestId] = useState({});

  const [formState, setFormState] = useState({
    classroomName: "",
    requestedDate: "",
    requestedStartTime: "15:30",
    requestedEndTime: "18:30",
    purpose: "",
  });

  const onFormChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const onCreateRequest = (event) => {
    event.preventDefault();

    const payload = new FormData();
    Object.entries(formState).forEach(([key, value]) =>
      payload.append(key, value),
    );

    startTransition(async () => {
      const result = await createClassroomAccessRequest(payload);

      if (!result.success) {
        toast.error(result.error ?? "Failed to create request.");
        return;
      }

      setRequests((prev) => [result.request, ...prev]);
      setFormState({
        classroomName: "",
        requestedDate: "",
        requestedStartTime: "15:30",
        requestedEndTime: "18:30",
        purpose: "",
      });
      toast.success("Classroom request submitted.");
    });
  };

  const onFileSelect = (requestId, file) => {
    setFilesByRequestId((prev) => ({ ...prev, [requestId]: file }));
  };

  const onUploadProof = (requestId) => {
    const selectedFile = filesByRequestId[requestId];

    if (!selectedFile) {
      toast.error("Please select an image first.");
      return;
    }

    startTransition(async () => {
      const uploadForm = new FormData();
      uploadForm.append("file", selectedFile);

      const uploadResponse = await fetch("/api/uploads/lock-proof", {
        method: "POST",
        body: uploadForm,
      });

      const uploadJson = await uploadResponse.json();
      if (!uploadResponse.ok || !uploadJson?.url) {
        toast.error(uploadJson?.error ?? "Image upload failed.");
        return;
      }

      const result = await submitLockProof(requestId, uploadJson.url);
      if (!result.success) {
        toast.error(result.error ?? "Failed to submit lock proof.");
        return;
      }

      setRequests((prev) =>
        prev.map((item) =>
          item.id === requestId
            ? {
                ...item,
                status: "LOCK_PROOF_SUBMITTED",
                lockProofImageUrl: uploadJson.url,
                lockProofSubmittedAt: new Date().toISOString(),
              }
            : item,
        ),
      );
      setFilesByRequestId((prev) => ({ ...prev, [requestId]: undefined }));
      toast.success("Lock proof uploaded and sent to Class Teacher.");
    });
  };

  return (
    <div className="grid gap-6">
      <Card className="bg-card/70">
        <CardHeader>
          <CardTitle>Request Classroom After Lectures</CardTitle>
          <CardDescription>
            Class Representatives can request a classroom only after lectures
            end at 3:30 PM.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={onCreateRequest}
          >
            <div className="grid gap-2">
              <Label htmlFor="classroomName">Classroom Number</Label>
              <Input
                id="classroomName"
                placeholder="e.g. 401"
                value={formState.classroomName}
                onChange={(event) =>
                  onFormChange("classroomName", event.target.value)
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="requestedDate">Date</Label>
              <Input
                id="requestedDate"
                type="date"
                value={formState.requestedDate}
                onChange={(event) =>
                  onFormChange("requestedDate", event.target.value)
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="requestedStartTime">Start Time</Label>
              <Input
                id="requestedStartTime"
                type="time"
                value={formState.requestedStartTime}
                onChange={(event) =>
                  onFormChange("requestedStartTime", event.target.value)
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="requestedEndTime">End Time</Label>
              <Input
                id="requestedEndTime"
                type="time"
                value={formState.requestedEndTime}
                onChange={(event) =>
                  onFormChange("requestedEndTime", event.target.value)
                }
                required
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea
                id="purpose"
                placeholder="Why is the classroom needed after lecture hours?"
                value={formState.purpose}
                onChange={(event) =>
                  onFormChange("purpose", event.target.value)
                }
                required
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card/70">
        <CardHeader>
          <CardTitle>Your Classroom Access Requests</CardTitle>
          <CardDescription>
            After leaving the classroom, upload a photo of the locked door for
            teacher confirmation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Classroom</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Proof</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    No requests yet.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{formatDate(request.requestedDate)}</TableCell>
                    <TableCell>{request.classroomName}</TableCell>
                    <TableCell>
                      {request.requestedStartTime} - {request.requestedEndTime}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>
                      {request.classTeacher?.username ?? "-"}
                    </TableCell>
                    <TableCell>
                      {request.status === "REQUESTED" ? (
                        <span className="text-sm text-muted-foreground">
                          Waiting for teacher approval
                        </span>
                      ) : request.status === "APPROVED" ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            className="max-w-[220px]"
                            onChange={(event) =>
                              onFileSelect(request.id, event.target.files?.[0])
                            }
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onUploadProof(request.id)}
                            disabled={isPending}
                          >
                            Upload
                          </Button>
                        </div>
                      ) : request.lockProofImageUrl ? (
                        <a
                          href={request.lockProofImageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-primary underline underline-offset-4"
                        >
                          View Image
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
