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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  approveClassroomAccessRequest,
  confirmClassroomLock,
  rejectClassroomAccessRequest,
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

export default function ClassroomRequestsReviewClient({
  initialRequests = [],
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [remarksByRequestId, setRemarksByRequestId] = useState({});
  const [isPending, startTransition] = useTransition();

  const applyLocalStatus = (requestId, status, remarks) => {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status,
              teacherRemarks: remarks || null,
              ...(status === "LOCK_CONFIRMED" || status === "LOCK_REJECTED"
                ? { teacherConfirmedAt: new Date().toISOString() }
                : {}),
            }
          : request,
      ),
    );
  };

  const handleApprove = (requestId) => {
    const remarks = remarksByRequestId[requestId] ?? "";

    startTransition(async () => {
      const result = await approveClassroomAccessRequest(requestId, remarks);

      if (!result.success) {
        toast.error(result.error ?? "Failed to approve request.");
        return;
      }

      applyLocalStatus(requestId, "APPROVED", remarks);
      toast.success("Classroom access approved.");
    });
  };

  const handleReject = (requestId) => {
    const remarks = remarksByRequestId[requestId] ?? "";

    startTransition(async () => {
      const result = await rejectClassroomAccessRequest(requestId, remarks);

      if (!result.success) {
        toast.error(result.error ?? "Failed to reject request.");
        return;
      }

      applyLocalStatus(requestId, "LOCK_REJECTED", remarks);
      toast.success("Classroom request rejected.");
    });
  };

  const handleConfirmLock = (requestId) => {
    const remarks = remarksByRequestId[requestId] ?? "";

    startTransition(async () => {
      const result = await confirmClassroomLock(requestId, true, remarks);

      if (!result.success) {
        toast.error(result.error ?? "Failed to confirm lock.");
        return;
      }

      applyLocalStatus(requestId, "LOCK_CONFIRMED", remarks);
      toast.success("Lock confirmation approved.");
    });
  };

  return (
    <Card className="bg-card/70">
      <CardHeader>
        <CardTitle>Classroom Lock Proof Reviews</CardTitle>
        <CardDescription>
          Approve or reject new requests first. Once approved, CR uploads lock
          proof and you can confirm final closure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Classroom</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Proof</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  No classroom requests found.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => {
                const canApprove = request.status === "REQUESTED";
                const canConfirmLock =
                  request.status === "LOCK_PROOF_SUBMITTED";
                const canWriteRemarks = canApprove || canConfirmLock;

                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {request.requestedBy?.username ?? "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {request.requestedBy?.email ?? "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(request.requestedDate)}</TableCell>
                    <TableCell>{request.classroomName}</TableCell>
                    <TableCell>
                      {request.requestedStartTime} - {request.requestedEndTime}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>
                      {request.lockProofImageUrl ? (
                        <a
                          href={request.lockProofImageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-primary underline underline-offset-4"
                        >
                          View Image
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Not uploaded
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Optional notes"
                        value={
                          remarksByRequestId[request.id] ??
                          request.teacherRemarks ??
                          ""
                        }
                        onChange={(event) =>
                          setRemarksByRequestId((prev) => ({
                            ...prev,
                            [request.id]: event.target.value,
                          }))
                        }
                        disabled={isPending || !canWriteRemarks}
                      />
                    </TableCell>
                    <TableCell>
                      {canApprove ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleApprove(request.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={isPending}
                            onClick={() => handleReject(request.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : canConfirmLock ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleConfirmLock(request.id)}
                          >
                            Confirm Lock
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={isPending}
                            onClick={() => handleReject(request.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : request.status === "APPROVED" ? (
                        <span className="text-sm text-muted-foreground">
                          Waiting for lock proof
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Reviewed
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
