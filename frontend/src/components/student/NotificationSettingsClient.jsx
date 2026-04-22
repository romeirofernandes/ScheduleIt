"use client";

import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  Calendar01Icon,
  CheckmarkCircle01Icon,
  Loading03Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";

import {
  sendMyNextLectureNotification,
  updateStudentNotificationSettings,
} from "@/actions/notifications/student-notification-action";

export function NotificationSettingsClient({ initialData }) {
  const [notificationEmail, setNotificationEmail] = useState(
    initialData.user.notificationEmail || "",
  );
  const [notificationEnabled, setNotificationEnabled] = useState(
    initialData.user.notificationEnabled,
  );
  const [isSaving, startSaving] = useTransition();
  const [isSending, startSending] = useTransition();

  const effectiveEmailPreview = useMemo(() => {
    const preferred = notificationEmail.trim().toLowerCase();
    return preferred || initialData.user.email;
  }, [notificationEmail, initialData.user.email]);

  const saveSettings = () => {
    startSaving(async () => {
      const formData = new FormData();
      formData.set("notificationEmail", notificationEmail.trim().toLowerCase());
      formData.set("notificationEnabled", String(notificationEnabled));

      const result = await updateStudentNotificationSettings(formData);

      if (result.success) {
        toast.success("Notification settings saved.", {
          icon: (
            <HugeiconsIcon
              icon={CheckmarkCircle01Icon}
              size={16}
              strokeWidth={1.8}
              className="text-green-500"
            />
          ),
        });
        return;
      }

      toast.error(result.error || "Could not save settings.", {
        icon: (
          <HugeiconsIcon
            icon={AlertCircleIcon}
            size={16}
            strokeWidth={1.8}
            className="text-destructive"
          />
        ),
      });
    });
  };

  const sendNextLectureNow = () => {
    startSending(async () => {
      const result = await sendMyNextLectureNotification();

      if (result.success) {
        toast.success(`Notification email sent to ${result.to}.`, {
          icon: (
            <HugeiconsIcon
              icon={CheckmarkCircle01Icon}
              size={16}
              strokeWidth={1.8}
              className="text-green-500"
            />
          ),
        });
        return;
      }

      toast.error(result.error || "Could not send notification.", {
        icon: (
          <HugeiconsIcon
            icon={AlertCircleIcon}
            size={16}
            strokeWidth={1.8}
            className="text-destructive"
          />
        ),
      });
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
      <Card className="border-border/60 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} />
            Email Notifications
          </CardTitle>
          <CardDescription>
            By default we use your account email. You can set a different email
            for lecture notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Account email</Label>
            <Input value={initialData.user.email} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notificationEmail">Notification email (optional)</Label>
            <Input
              id="notificationEmail"
              value={notificationEmail}
              onChange={(event) => setNotificationEmail(event.target.value)}
              placeholder="Leave empty to use account email"
            />
            <p className="text-xs text-muted-foreground">
              Effective notification email: {effectiveEmailPreview || "Not configured"}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Notification status</Label>
            <Select
              value={notificationEnabled ? "enabled" : "disabled"}
              onValueChange={(value) => setNotificationEnabled(value === "enabled")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={saveSettings}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving && (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  size={16}
                  strokeWidth={1.8}
                  className="animate-spin"
                />
              )}
              Save settings
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={sendNextLectureNow}
              disabled={isSending}
              className="gap-2"
            >
              {isSending && (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  size={16}
                  strokeWidth={1.8}
                  className="animate-spin"
                />
              )}
              Send next lecture now
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} />
            Next Lecture Preview
          </CardTitle>
          <CardDescription>
            The upcoming lecture details that will be sent in your email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {initialData.nextLecture ? (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Subject:</span>{" "}
                {initialData.nextLecture.subject}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Type:</span>{" "}
                {initialData.nextLecture.entryType}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">When:</span>{" "}
                {initialData.nextLecture.day}, {initialData.nextLecture.startLabel} - {initialData.nextLecture.endLabel}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Venue:</span>{" "}
                {initialData.nextLecture.venue}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No upcoming lecture found for your class right now.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
