/**
 * ProfileForm — shared role-aware account form (identity display + change password).
 * ONE source for the admin and member profiles (was duplicated per portal, ~80%
 * identical). The change-password card is shared; the identity presentation branches
 * on the user's role. Superadmin never reaches it: /profile is gated [ADMIN, MEMBER]
 * and the Profile link is hidden for superadmins (console-managed — see LESSONS_BIN).
 *
 * Pre-Write Check:
 *   1. Primitives: Card, Input, Label, Button (shadcn); lucide Loader2/User; supabase
 *      browser client. Considered two copy-pasted forms — rejected (this is the dedup).
 *   2. Manual ref: COMPONENT_REGISTRY; UI-UX Rule Zero.
 *   3. 375 sketch: single centered column of cards — (member: avatar/identity card) +
 *      Account Info + Change Password; full-width inputs; full-width submit.
 *   4. 768/1024: same single column (page wrapper caps at max-w-2xl); no column split.
 *   Touch targets: inputs are p-6; the submit Button meets 44px on touch (coarse floor).
 */
"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { AppRole } from "@/utils/app-role";

interface Props {
  user: SupabaseUser;
  role: AppRole;
}

const ProfileForm = ({ user, role }: Props) => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const { toast } = useToast();

  const isMember = role === AppRole.MEMBER;

  const displayName: string =
    user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User";

  const initials = displayName
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Password updated successfully" });
      setPassword("");
      setConfirmPassword("");
      setValidationError(null);
    }
  };

  return (
    <div className="space-y-6">
      {isMember ? (
        <>
          {/* Avatar + identity card (member) */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0 w-20 h-20 rounded-full bg-role-member/10 flex items-center justify-center border-2 border-role-member">
                  {initials ? (
                    <span className="text-2xl font-bold text-role-member">
                      {initials}
                    </span>
                  ) : (
                    <User className="w-8 h-8 text-role-member" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-bold">{displayName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-role-member text-role-member-foreground">
                    Member
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account info (member: Full Name + Email) */}
          <Card>
            <CardHeader>
              <CardTitle>Account Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="uppercase text-xs font-bold text-muted-foreground">
                  Full Name
                </Label>
                <Input
                  className="p-6 bg-muted text-foreground mt-2 opacity-60 cursor-not-allowed"
                  value={displayName}
                  disabled
                />
              </div>
              <div>
                <Label className="uppercase text-xs font-bold text-muted-foreground">
                  Email
                </Label>
                <Input
                  className="p-6 bg-muted text-foreground mt-2 opacity-60 cursor-not-allowed"
                  value={user.email ?? "—"}
                  disabled
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Contact an admin to change your email or name
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Account info (admin: Email + Role) */
        <Card>
          <CardHeader>
            <CardTitle>Account Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="uppercase text-xs font-bold text-muted-foreground">
                Email
              </Label>
              <Input
                className="p-6 bg-muted text-foreground mt-2 opacity-60 cursor-not-allowed"
                value={user.email ?? "—"}
                disabled
              />
              <p className="text-sm text-muted-foreground mt-1">
                Email cannot be changed
              </p>
            </div>
            <div>
              <Label className="uppercase text-xs font-bold text-muted-foreground">
                Role
              </Label>
              <p className="text-base font-bold mt-2 text-role-admin">Admin</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Change Password (shared by all roles) */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <Label className="uppercase text-xs font-bold text-muted-foreground">
                New Password
              </Label>
              <Input
                className="p-6 bg-muted text-foreground mt-2"
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Label className="uppercase text-xs font-bold text-muted-foreground">
                Confirm New Password
              </Label>
              <Input
                className="p-6 bg-muted text-foreground mt-2"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {validationError && (
                <p className="text-sm text-destructive mt-1">{validationError}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileForm;
