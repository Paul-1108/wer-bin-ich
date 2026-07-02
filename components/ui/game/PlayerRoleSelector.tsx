"use client";

import { Button } from "@/components/ui/button";
import type { PlayerRole, PlayerSlotsDTO, ViewerRole } from "@/lib/game/types";

type PlayerRoleSelectorProps = {
  slots: PlayerSlotsDTO;
  viewerRole: ViewerRole;
  disabled?: boolean;
  onJoin: (role: PlayerRole) => void;
};

function roleText(role: PlayerRole) {
  return role === "PLAYER_1" ? "Spieler 1" : "Spieler 2";
}

export function PlayerRoleSelector({ slots, viewerRole, disabled = false, onJoin }: PlayerRoleSelectorProps) {
  const roles: PlayerRole[] = ["PLAYER_1", "PLAYER_2"];

  return (
    <section className="rounded-lg border border-border p-4">
      <h2 className="text-sm font-semibold">Rolle waehlen</h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Sobald beide Rollen belegt sind, koennen weitere Besucher nur zuschauen.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {roles.map((role) => {
          const taken = role === "PLAYER_1" ? slots.player1Taken : slots.player2Taken;
          const ownRole = viewerRole === role;

          return (
            <Button
              disabled={disabled || (taken && !ownRole) || (viewerRole !== "SPECTATOR" && !ownRole)}
              key={role}
              onClick={() => onJoin(role)}
              type="button"
              variant={ownRole ? "default" : "outline"}
            >
              {ownRole ? `${roleText(role)} aktiv` : taken ? "Belegt" : roleText(role)}
            </Button>
          );
        })}
      </div>
    </section>
  );
}
